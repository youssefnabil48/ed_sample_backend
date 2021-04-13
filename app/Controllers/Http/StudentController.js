'use strict'

const Hash = use('Hash');
const UserService = use('App/Services/User/UserService');
const StudentService = use('App/Services/User/StudentService.js');
const Http = use('App/Helpers/Http');
const Messages = use('App/Constants/Messages');
const CustomException = use('App/Exceptions/CustomException');
const TalentLMS = use('TalentLms')
const ClassroomService = use('App/Services/Classroom/ClassroomService')
const UnauthorizedException = use('App/Exceptions/UnauthorizedException')
const ValidationException = use('App/Exceptions/ValidationException')
const ForbiddenException = use('App/Exceptions/ForbiddenException')
const ConflictException = use('App/Exceptions/ConflictException')
const ResourceNotFoundException = use('App/Exceptions/ResourceNotFoundException')
const _ = use('lodash')
const InstructorService = use('App/Services/User/InstructorService')
const WalletLog = use('App/Models/WalletLog')
const Timeline = use('App/Models/Timeline')
const Course = use('App/Models/Course')
const Classroom = use('App/Models/Classroom')
const Helpers = use('App/Helpers/Helpers')
const UnitTypeMapper = use('App/Helpers/UnitTypeMapper')
const Cache = use('Cache')
const Database = use('Database')
const moment = use('moment')

class StudentController {
  //defining dependencies
  constructor() {
    this.userService = new UserService()
    this.studentService = new StudentService()
    this.classroomService = new ClassroomService()
    this.instructorService = new InstructorService()
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Auth} ctx.auth
   */
  async getStudentProfile({request, response, auth}) {
    //getting the whole user profile from database
    let userProfile = await this.userService.getUserProfile(request.user.id);
    //return response to user
    return Http.sendResponse(response, true, userProfile, Messages.user.success.userProfile);
  }


  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Auth} ctx.auth
   */
  async updateStudentProfile({request, response, auth}) {
    await this.studentService.updateStudentProfile(request.user.id, request.body);
    return Http.sendResponse(response, true, null, Messages.user.success.editProfile);
  }


  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Auth} ctx.auth
   */
  async completeStudentLoginProfile({request, response, auth}) {
    let lms_user = null
    try{
      lms_user = await TalentLMS.Users.userSignup({
        first_name: request.user.first_name,
        last_name: request.user.last_name,
        login: request.user.username,
        password: request.user.uuid.substring(2),
        email: request.user.email
      })
    }catch (e) {
      lms_user = await TalentLMS.Users.getUserByEmail(request.user.email)
      if(!request.user.lms_id){
        request.user.lms_id = lms_user.id
        await request.user.save()
      }
    }
    await this.userService.update(request.user.id, {'lms_id': lms_user.id})
    await this.studentService.completeStudentLoginProfile(request.user.id, request.body);
    return Http.sendResponse(response, true, null, Messages.user.success.editProfile)
  }


  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Auth} ctx.auth
   */
  async completeStudentBuyProfile({request, response, auth}) {
    await this.studentService.completeStudentBuyProfile(request.user.id, request.body);
    return Http.sendResponse(response, true, null, Messages.user.success.editProfile)
  }


  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async changePassword({request, response, auth}) {
    let user = request.user;
    if (!(await Hash.verify(request.body.old_password, user.password)))
      throw new CustomException('Incorrect Password', 400)
    if (request.body.new_password !== request.body.confirm_new_password)
      throw new CustomException('Passwords doesn\'t match', 400);
    user.password = request.body.new_password;
    await user.save();
    return Http.sendResponse(response, true, null, 'Password changed successfully');
  }


  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async uploadProfilePic({request, response, auth}) {
    let photoUrl = await this.userService.uploadProfilePic(request.user, request);
    return Http.sendResponse(response, true, photoUrl, 'Profile Photo updated successfully');
  }


  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getWalletHistory({request, response}){
    const walletHistoryQuery = WalletLog.query().where('user_id', request.user.id)
    const filters = request.body.filters
    const sort = request.body.sortBy
    const from = request.body.from
    const to = request.body.to
    if (filters){
      filters.forEach(filter => {
        walletHistoryQuery.whereHas('invoice', (builder) => {
          builder.where(filter)
        })
      })
    }
    if(from) walletHistoryQuery.where(Database.raw('DATE(timestamp)'), '>=', moment(from, 'YYYY/MM/DD').format('YYYY-MM-DD'))
    if(to) walletHistoryQuery.where(Database.raw('DATE(timestamp)'), '<=', moment(to, 'YYYY/MM/DD').format('YYYY-MM-DD'))
    if(Math.ceil(Number((await walletHistoryQuery.clone().count())[0].count) / Number(request.body.perPage)) < Number(request.body.page)){
      request.body.page = 1
    }
    if (sort){
      walletHistoryQuery.orderBy(request.body.sortBy.field, request.body.sortBy.direction)
    }
    const walletHistory = await walletHistoryQuery.with('invoice.transaction').paginate(request.body.page, request.body.perPage)
    return Http.sendResponse(response, true,walletHistory , 'User wallet History')
  }


  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getTimeline({request, response}){
    const timelineQuery = Timeline.query().where('user_id', request.user.id)
    const filters = request.body.filters
    const sort = request.body.sortBy
    const from = request.body.from
    const to = request.body.to
    if (filters){
      filters.forEach(filter => {
        timelineQuery.where(filter)
      })
    }
    if(from) timelineQuery.where(Database.raw('DATE(timestamp)'), '>=', moment(from, 'YYYY/MM/DD').format('YYYY-MM-DD'))
    if(to) timelineQuery.where(Database.raw('DATE(timestamp)'), '<=', moment(to, 'YYYY/MM/DD').format('YYYY-MM-DD'))
    if(Math.ceil(Number((await timelineQuery.clone().count())[0].count) / Number(request.body.perPage)) < Number(request.body.page)){
      request.body.page = 1
    }
    if (sort){
      timelineQuery.orderBy(request.body.sortBy.field, request.body.sortBy.direction)
    }
    const timeline = await timelineQuery.paginate(request.body.page, request.body.perPage)
    return Http.sendResponse(response, true,timeline , 'User Timeline')
  }


  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getAllInvoices({request, response}){
    //getting user invoices
    let userInvoices = await this.studentService.getAllInvoices(request.user, request.body.filters, request.body.from, request.body.to);
    //return response to user
    return Http.sendResponse(response, true, userInvoices, 'User Invoices');
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getSubscribedClassrooms({request, response}){
    //getting user invoices
    let subscribedClassrooms = await this.studentService.getSubscribedClassrooms(request.user);
    //return response to user
    return Http.sendResponse(response, true, subscribedClassrooms, 'User Classrooms');
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async getPurchasedCourses({request, response}){
    //getting user purchased courses
    let purchasedCourses = await this.studentService.getPurchasedCourses(request.user);
    //return response to user
    return Http.sendResponse(response, true, purchasedCourses, 'User Courses');
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async parentStudentProfileCheck({request, response}){
    await this.studentService.findStudentForParentOrFail(request.body.parentPhone, request.body.username)
    return Http.sendResponse(response, true, null, 'parent login')
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async parentStudentProfile({request, response}){
    let analytics = {
      completed : 0,
      in_progress : 0,
      notStarted : 0,
      expired: 0,
      inComplete: 0,
      failed: 0
    }
    //NEEDDSSS REFACTOORRRRRR
    let classrooms = []
    const user = await this.studentService.findStudentForParentOrFail(request.body.parentPhone, request.body.username)
    let profile = await Cache.remember('studentProfile:username:'+user.username, 15, async () => {
      return await this.instructorService.getStudentLmsProfile(user)
    })
    // const profile = await this.instructorService.getStudentLmsProfile(user)
    for (let [i,course] of profile.courses.entries()) {
      const dbCourse = await Course.query().where('lms_id', course.id).with('classroom').first()
      if(!dbCourse) continue
      course.classroom_id = dbCourse.toJSON().classroom.id
      course.id = dbCourse.id
      course.order = dbCourse.number
      course.expiry = course.expired_on
      // check if course is expired and update status
      if(!course.expired_on) {
        course.expiry_status = 'unlimited'
      }else{
        moment(course.expired_on, 'DD/MM/YYYY, hh:mm:ss') < moment(Helpers.now('DD/MM/YYYY, HH:mm:ss'), 'DD/MM/YYYY, hh:mm:ss') ? course.expiry_status = 'expired' : course.expiry_status = 'active'
      }
      if(course.completion_status === 'not_attempted') {
        analytics.notStarted++
        course.completion_status = 'not started'
      }
      if(course.completion_status === 'failed') {
        analytics.failed++
        course.completion_status = 'not passed'
      }
      if(course.completion_status === 'completed') analytics.completed++
      if(course.completion_status === 'incomplete' && course.expiry_status !== 'expired') {
        analytics.in_progress++
        course.completion_status = 'in progress'
      }
      if(course.completion_status === 'incomplete' && course.expiry_status === 'expired') analytics.inComplete++
      if(course.expiry_status === 'expired' && course.completion_status !== 'completed') analytics.expired++
      profile.courses[i] = course
    }
    profile.courses = _.orderBy(profile.courses, 'order')
    const classroomIds = _.groupBy(profile.courses, 'classroom_id')
    for (const classroomId of Object.keys(classroomIds).filter(function (el) {
      return el !== 'undefined';
    })) {
      const dbClassroom = await Classroom.query().where('id', classroomId).with('instructor.user').first()
      dbClassroom.courses = classroomIds[classroomId]
      classrooms.push(dbClassroom.toJSON())
    }
    profile.classrooms = classrooms
    profile.analytics = analytics
    delete profile.courses
    return Http.sendResponse(response, true, profile, 'student profile')
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async ProgressInCourse({request, response}){
    const course = await this.classroomService.findCourse('id', request.body.course_id)
    if (!course) throw new ResourceNotFoundException('Course not found')
    const user = await this.userService.findByOrFail('username', request.body.username)
    let testDenominators, lmsCourseObj = null
    try {
      lmsCourseObj = await TalentLMS.Courses.getCourse(course.lms_id)
    }catch (error) {
      throw new CustomException('Error getting course information')
    }
    try {
      testDenominators = JSON.parse(lmsCourseObj.custom_field_1)
    }catch (error) {}

    let progress = await Cache.remember('progressInCourse:username:'+user.username+'course:'+course.id, 15, async () => {
      return await this.studentService.getStudentProgressInCourse(user, course)
    })

    progress.units = _.map(progress.units, (unit) => {
      unit.type = UnitTypeMapper.map(unit.type)
      const splintedName = unit.name.split(')')
      unit.order = Number(splintedName[0])
      unit.name = splintedName[1] || unit.name
      if(testDenominators) unit.outOf = testDenominators[unit.id]
      if(unit.outOf)
        unit.score_in_numbers = Math.round(unit.score*unit.outOf/100)+`/${unit.outOf}`
      return unit
    })
    progress.units = _.orderBy(progress.units, 'order')
    return Http.sendResponse(response, true, progress, 'student progress')
  }
}

module.exports = StudentController
