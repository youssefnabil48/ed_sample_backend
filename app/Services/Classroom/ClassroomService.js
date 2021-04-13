'use strict'

const Classroom = use('App/Models/Classroom')
const ResourceNotFoundException = use('App/Exceptions/ResourceNotFoundException')
const _ = use('lodash')
const Student = use('App/Models/Student')
const Helpers = use('App/Helpers/Helpers')
const Scratchcard = use('App/Models/Scratchcard')
const ForbiddenException = use('App/Exceptions/ForbiddenException')
const BadRequestException = use("App/Exceptions/BadRequestException")
const Course = use('App/Models/Course')
const TalentLMS = use('TalentLms')
const Subscription = use('App/Models/Subscription')
const EnrollCourse = use('App/Models/EnrollCourse')
const CustomException = use('App/Exceptions/CustomException')
const TransactionService = use('App/Services/Invoice/TransactionService')
const InvoiceService = use('App/Services/Invoice/InvoiceService')
const StudentService = use('App/Services/User/StudentService')
const moment = use('moment')
const Cache = use('Cache')

class ClassroomService {

  constructor() {
    this.transactionService = new TransactionService()
    this.invoiceService = new InvoiceService()
    this.studentService = new StudentService()
  }

  async search(queryParams) {
    const classrooms = await Classroom.query().with('instructor.user').with('category')
      .select('*')
      .select('classrooms.id as classroom_id')
      .select('users.id as user_id')
      .select('instructors.user_id as instructor_id')
      .innerJoin('users', 'classrooms.instructor_id', 'users.id')
      .innerJoin('instructors', 'classrooms.instructor_id', 'instructors.user_id')
      .where('classrooms.title', 'ILIKE', '%' + queryParams.query + '%')
      .orWhere('classrooms.description', 'ILIKE', '%' + queryParams.query + '%')
      .orWhere('instructors.branch_name', 'ILIKE', '%' + queryParams.query.split(" ").join("") + '%')
      .orWhere('users.first_name', 'ILIKE', '%' + queryParams.query + '%')
      .orWhere('users.last_name', 'ILIKE', '%' + queryParams.query + '%')
      .fetch()
    return Classroom.query().with('instructor.user').with('category').whereIn('id',classrooms.toJSON().map((classroom) => {
      return classroom.classroom_id
    })).fetch()
  }

  async all(queryParams) {
    queryParams = _.pick(queryParams, ['type', 'language', 'category'])
    let {category, ...params} = queryParams
    let query = Classroom.query().with('instructor.user')
    if (category) {
      query.whereHas('category', (builder) => {
        builder.where('name', Helpers.capitalizeWord(category))
      })
    }
    query.with('category')
    for (const [key, value] of Object.entries(params)) {
      query.where(key, value)
    }
    return query.fetch()
  }

  async getClassroomByLabel(label) {
    return Classroom.query().with('instructor.user').with('category').with('courses', builder=>{
      builder.orderBy('number')
      builder.with('units')
    })
      .where('label', label).first()
  }

  async getCourseByIdOrFail(id){
    const course = await Course.find(id)
    if (!course)
      throw new ResourceNotFoundException('Course Not Found')
    return course
  }

  async getClassroomByIdOrFail(id) {
    const classroom = await Classroom.find(id)
    if (!classroom)
      throw new ResourceNotFoundException('Classroom Not Found')
    return classroom
  }

  async subscribeToClassroom(user, classroom, plan) {
    const student = await Student.find(user.id)
    let type, quota;
    if (classroom.type === 'onGround') {
      type = 'onGround'
      quota = -1
    } else {
      if (plan === 'week') {
        type = 'week'
        quota = -1
      } else {
        type = 'month'
        quota = classroom.price * 3
      }
    }
    await student.classrooms().attach(classroom.id, (row) => {
      row.type = type
      row.quota = quota
    })
  }

  async enrollInCourses(user, courseIds) {
    const student = await Student.find(user.id);
    await student.courses().attach(courseIds)
  }

  async isEnrolledInCourse(user, course_id){
    const enrolled = await EnrollCourse.query().where('user_id', user.id).where('course_id', course_id).first()
    return !!enrolled;
  }

  async isSubscribedOrFail(user, classroom_id) {
    const subscriptions = await Subscription.query().where('user_id', user.id).where('classroom_id', classroom_id).first()
    if (!subscriptions) {
      throw new ForbiddenException('You must subscribe first')
    }
  }

  async isSubscribed(user, classroom_id) {
    return Subscription.query().where('user_id', user.id).where('classroom_id', classroom_id).first()
  }

  async enrollWithScratchcard(user, code, courseId) {
    const course = await Course.query().where('id', courseId).first()
    const classroom = await course.classroom().first()
    const instructor = await classroom.instructor().first()
    const card = await Scratchcard.query().where('code', code).where('classroom_id', classroom.id).first()
    if (!card) throw new ResourceNotFoundException('Invalid Code')
    if (card.user_id) throw new ForbiddenException('This Code has been used before!')
    if (classroom.type !== 'onGround') throw new ForbiddenException('Scratchcards only available for onGround classrooms')
    if (!course.status) throw new ForbiddenException('Course is not active')
    if(card.course_id && Number(card.course_id) !== Number(courseId))
      throw new ForbiddenException(`This code an only be used on ${course.name} course`)
    // onGround classrooms subscriptions
    try{
      await this.isSubscribedOrFail(user, classroom.id)
    }
    catch (error) {
      await this.subscribeToClassroom(user, classroom)
      //Add user to offline branch in talent without enrollment in any course
      try{
        await TalentLMS.Users.setStatus(user.lms_id, 'active')
      }catch (error) {
        throw new BadRequestException('Service unavailable at the moment')
      }
      try {
        await TalentLMS.Branches.addUsertoBranch(instructor.branch_id, user.lms_id)
      } catch (e) {}
    }
    //Enroll user in TalentLMS
    try {
      await TalentLMS.Courses.addUserToCourse({user_id: user.lms_id, course_id: course.lms_id, role: 'learner'})
    } catch (error) {
      throw new CustomException('Connection error occured, Please try again', 400)
    }
    await this.enrollInCourses(user, [courseId])
    card.user_id = user.id
    card.course_id = courseId
    await card.save()
    //Add code purchase log
    await this.studentService.addScratchcardTimelineLog(user, course, code)
  }

  async getEnrolledCourses(user, classroom_id) {
    // get student object
    const student = await user.student().first()
    // get all lms enrolled courses of student
    let lmsEnrolled = null
    try {
      lmsEnrolled = await Cache.remember('student:'+user.username, 5, async () => {
        return await TalentLMS.Users.getUserById(user.lms_id);
      })
    }catch (error) {
      throw new CustomException('Error getting enrolled courses information')
    }
    // get user enrolled courses in classroom from DB
    let enrolledCourses = await student.courses().where('classroom_id', classroom_id).fetch()
    for (const course of enrolledCourses.rows) {
      const lmscourse = _.find(lmsEnrolled.courses, {id: course.lms_id})
      course.expiry = lmscourse ? lmscourse.expired_on : ''
      course.expiry = course.expiry ? moment(course.expiry, 'DD/MM/YYYY, HH:mm:ss').format('DD/MM/YYYY, hh:mm A') : ''
      // check if course is expired and update status
      if (!course.expiry){
        course.expiry_status = 'unlimited'
      }else{
        moment(lmscourse.expired_on, 'DD/MM/YYYY, hh:mm:ss') < moment(Helpers.now('DD/MM/YYYY, HH:mm:ss'), 'DD/MM/YYYY, hh:mm:ss') ? course.expiry_status = 'expired' : course.expiry_status = 'active'
      }
    }
    return enrolledCourses
  }

  async cancelSubscription(user, classroom_id){
    const classroom = await Classroom.find(classroom_id)
    const subscription = await Subscription.query().where('classroom_id', classroom_id).where('user_id', user.id).first()
    if(!subscription) throw new ForbiddenException('User is not subscribed to this classroom')
    const student = await user.student().first()
    if(subscription.type === 'month'){
      const trx = await this.transactionService.createWalletTrx(subscription.quota, 'refunded')
      const invoice = await this.invoiceService.createWalletInvoice(trx, user.id, 'subscribe', 'refunded')
      await this.studentService.addToWallet(user, invoice.price, invoice, `${classroom.title} subscription cancelled`, true)
    }
    await student.classrooms().detach([classroom_id])
    // add cancel log
    await  this.studentService.addCancelTimelineLog(user, classroom, subscription.type)
  }

  async getGotoCourseUrl(user, course_id){
    const course = await Course.find(course_id)
    if(!course) throw new ResourceNotFoundException('Course Not Found')
    const isEnrolled = await this.isEnrolledInCourse(user, course_id)
    if(!isEnrolled) throw new ForbiddenException('User not enrolled in course')
    const isLmsEnrolled = await this.enrolledInLms(user, course)
    if(!isLmsEnrolled) await TalentLMS.Courses.addUserToCourse({user_id: user.lms_id, course_id: course.lms_id, role: 'learner'})
    const classroom = await course.classroom().first()
    const instructor = await classroom.instructor().first()
    const url = await TalentLMS.Courses.goToCourse(course.lms_id, user.lms_id, 'eduact.me')
    url.goto_url = url.goto_url.slice(0, 8) + instructor.branch_name+'-' + url.goto_url.slice(8 + Math.abs(0));
    return url
  }

  async getLmsBranchLoginUrl(user, classroomId){
    try{
      await TalentLMS.Users.editUser({user_id: user.lms_id, password: user.uuid.substring(2)})
      const classroom = await Classroom.find(classroomId)
      const instructor = await classroom.instructor().first()
      const loginObj = await TalentLMS.Users.userLogin({
        login: user.username,
        password: user.uuid.substring(2),
        logout_redirect: 'eduact.me'
      }, instructor.branch_name)
      loginObj.login_key = loginObj.login_key.slice(0, 8) + instructor.branch_name+'-' + loginObj.login_key.slice(8 + Math.abs(0));
      return loginObj
    }catch (error) {
      console.log(error)
      throw new CustomException('Could not perform login', 400)
    }
  }

  async getLmsLoginUrl(user){
    try{
      await TalentLMS.Users.editUser({user_id: user.lms_id, password: user.uuid.substring(2)})
      return TalentLMS.Users.userLogin({
        login: user.username,
        password: user.uuid.substring(2),
        logout_redirect: 'eduact.me'
      })
    }catch (error) {
      console.log(error)
      throw new CustomException('Could not perform login', 400)
    }
  }

  async enrolledInLms(user, course){
    try{
      await TalentLMS.Courses.getUserStatusInCourse(course.lms_id, user.lms_id)
      return true
    }catch (error){
      return false
    }

  }

  async findCourse(field, value){
    return Course.query().with('classroom').where(field, value).first()
  }

  async getPreviousCourse(course){
    return Course.query().with('classroom').where('classroom_id', course.classroom_id).where('number', course.number -1).first()
  }

}

module.exports = ClassroomService
