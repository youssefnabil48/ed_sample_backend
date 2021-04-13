'use strict'

const Http = use('App/Helpers/Http')
const Messages = use('App/Constants/Messages')
const InstructorService = use('App/Services/User/InstructorService')
const StudentService = use('App/Services/User/StudentService.js')
const ClassroomService = use('App/Services/Classroom/ClassroomService')

class InstructorController {

  constructor() {
    this.instructorService = new InstructorService()
    this.studentService = new StudentService()
    this.classroomervice = new ClassroomService()
  }

  async getAll({request, response}){
    const instructors = await this.instructorService.getAll()
    return Http.sendResponse(response, true, instructors, 'Instructors')
  }

  async get({request, response}){
    const instructor = await this.instructorService.get(request.get().label)
    return Http.sendResponse(response, true, instructor, 'Instructor')
  }

  async getStudentProgressInCourse({request, response}){
    const student = await this.studentService.findBy('username', request.params.student_username)
    const course = await this.classroomervice.findCourse('id', request.params.course_id)
    const previousCourse = await this.classroomervice.getPreviousCourse(course)
    const payload =  {
      current: await this.studentService.getStudentProgressInCourse(student, course),
      previousCourse:
        previousCourse? await this.studentService.getStudentProgressInCourse(student, previousCourse): 'Course doesn\'t exist'
    }
    return Http.sendResponse(response, true, payload, 'student progress')
  }

  async getStudentLmsProfile({request, response}){
    const student = await this.studentService.findBy('username', request.params.student_username)
    const profile = await this.instructorService.getStudentLmsProfile(student)
    return Http.sendResponse(response, true, profile, 'student profile')
  }
}

module.exports = InstructorController
