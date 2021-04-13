'use strict'

const ClassroomService = use('App/Services/Classroom/ClassroomService')
const StudentService = use('App/Services/User/StudentService')
const Http = use('App/Helpers/Http')
const ResourceNotFoundException = use('App/Exceptions/ResourceNotFoundException')
const ForbiddenException = use('App/Exceptions/ForbiddenException')
const TransactionService = use('App/Services/Invoice/TransactionService')
const InvoiceService = use('App/Services/Invoice/InvoiceService')
const Helpers = use('App/Helpers/Helpers')
const TalentLMS = use('TalentLms')
const Course = use('App/Models/Course')
const BadRequestException = use("App/Exceptions/BadRequestException")
const CartService = use('App/Services/Cart/CartService')
const UserService = use('App/Services/User/UserService')


class ClassroomController {

  constructor() {
    this.classroomService = new ClassroomService()
    this.studentService = new StudentService()
    this.transactionService = new TransactionService()
    this.invoiceService = new InvoiceService()
    this.cartService = new CartService()
    this.userService = new UserService()
  }

  /**
   * Search classrooms
   * Available search fields: instructor, title, description
   * @param request
   * @param response
   * @returns {Promise<*>}
   */
  async search({request, response}) {
    const classrooms = await this.classroomService.search(request.get())
    return Http.sendResponse(response, true, classrooms, 'Classrooms')
  }

  /**
   * Get all Classrooms with filters
   * Available filters: type, language, category
   * @param request
   * @param response
   * @returns {Promise<*>}
   */
  async getAll({request, response}) {
    const classrooms = await this.classroomService.all(request.get())
    return Http.sendResponse(response, true, classrooms, 'Classrooms')
  }


  async getClassroom({request, response}) {
    const classroom = await this.classroomService.getClassroomByLabel(request.params.label)
    if (!classroom)
      throw new ResourceNotFoundException('Classroom not found')
    return Http.sendResponse(response, true, classroom, 'Classroom')
  }

  /**
   * Subscribe user to a specific classroom given a plan (week/month) OR Subscribe user in onGround course
   * @param request
   * @param response
   * @returns {Promise<void>}
   */
  async subscribe({request, response}) {
    const classroom = await this.classroomService.getClassroomByIdOrFail(request.input('classroom_id'))
    let price = Number(classroom.price)
    if (price < 0)
      throw new ForbiddenException('Classroom Inactive')
    const instructor = await classroom.instructor().first()
    const course = await Course.findBy('id', classroom.current_course)
    // online classrooms subscriptions
    if (!classroom.current_course) throw new ResourceNotFoundException('Classroom is still inactive')
    // check if user is already enrolled caused by previous subscription
    const isAlreadyEnrolled = await this.classroomService.isEnrolledInCourse(request.user, classroom.current_course)
    // decline subscription request
    if(isAlreadyEnrolled) throw new ForbiddenException('Cannot subscribe at this moment')
    if (request.input('plan') === 'month')
      price *= 4
    //Enroll in TalentLMS
    await this.studentService.isSufficient(request.user, price)
    try{
      await TalentLMS.Users.setStatus(request.user.lms_id, 'active')
    }catch (error) {
      throw new BadRequestException('Service unavailable at the moment')
    }
    //adding user to branch with ignoring the exception as fails if user already in the branch
    try{
      await TalentLMS.Branches.addUsertoBranch(instructor.branch_id, request.user.lms_id)
    } catch (error) {}
    //enroll user to course with catching exception if the user failed to enroll in talent lms
    try{
      await TalentLMS.Courses.addUserToCourse({user_id: request.user.lms_id, course_id: course.lms_id, role: 'learner'})
    }catch (error) {
      console.error('Failure in checkout single course error: ')
      console.error(error)
      throw new BadRequestException(error.message)
    }
    const trx = await this.transactionService.createWalletTrx(price)
    const invoice = await this.invoiceService.createWalletInvoice(trx, request.user.id, 'subscribe')
    await invoice.courses().attach([classroom.current_course])
    //deducting amount from wallet if the enrollment is successful with specifying the reason for debugging
    await this.studentService.deductFromWallet(request.user, invoice.price, invoice, `${classroom.title} ${request.input('plan')}ly subscription`)
    await this.classroomService.subscribeToClassroom(request.user, classroom, request.input('plan'))
    await this.classroomService.enrollInCourses(request.user, [classroom.current_course])
    // add subscribe log
    await this.studentService.addSubscribeTimelineLog(request.user, classroom, request.input('plan'))
    return Http.sendResponse(response, true, classroom, 'Subscription Successful')
  }


  async cancelSubscription({request, response}){
    await this.classroomService.cancelSubscription(request.user, request.input('classroom_id'))
    return Http.sendResponse(response, true, null, 'Subscription Cancelled')
  }

  /**
   *
   * @param request
   * @param response
   * @returns {Promise<void>}
   */
  async enrollOnGroundCourse({request, response}) {
    await this.classroomService.enrollWithScratchcard(request.user, request.input('code'), request.input('course_id'))
    return Http.sendResponse(response, true, null, 'Enrolled Successfully')
  }


  /**
   * Get user's enrolled course in a specific classroom
   * @param request
   * @param response
   * @returns {Promise<*>}
   */
  async getEnrolledCourses({request, response}) {
    const courses = await this.classroomService.getEnrolledCourses(request.user, request.get().classroom_id)
    return Http.sendResponse(response, true, courses, 'Enrolled Courses')
  }

  async gotoCourse({request, response}){
    const url = await this.classroomService.getGotoCourseUrl(request.user,request.get().course_id)
    await this.userService.saveLoginIp(request.user, request)
    return Http.sendResponse(response, true, url, 'Course Url')
  }

  async gotoClassroom({request, response}){
    const url = await this.classroomService.getLmsBranchLoginUrl(request.user,request.get().classroom_id)
    await this.userService.saveLoginIp(request.user, request)
    return Http.sendResponse(response, true, url, 'Classroom Url')
  }

}

module.exports = ClassroomController
