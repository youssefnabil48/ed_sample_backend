'use strict'

const CheckoutService = use('App/Services/Checkout/CheckoutService')
const CartService = use('App/Services/Cart/CartService')
const ClassroomService = use('App/Services/Classroom/ClassroomService')
const StudentService = use('App/Services/User/StudentService')
const Http = use('App/Helpers/Http')
const AcceptCash = use('AcceptCash')
const Helpers = use('App/Helpers/Helpers')
const TransactionService = use('App/Services/Invoice/TransactionService')
const InvoiceService = use('App/Services/Invoice/InvoiceService')
const Rates = use('App/Constants/Rates')
const Course = use('App/Models/Course')
const TalentLMS = use('TalentLms')
const ForbiddenException = use("App/Exceptions/ForbiddenException")
const BadRequestException = use("App/Exceptions/BadRequestException")

class CheckoutController {

  constructor() {
    this.checkoutService = new CheckoutService()
    this.cartService = new CartService()
    this.studentService = new StudentService()
    this.classroomService = new ClassroomService()
    this.transactionService = new TransactionService()
    this.invoiceService = new InvoiceService()
  }

  async checkout({request, response}){
    const paymentMethod = request.input('payment_method')
    await this.cartService.isEmpty(request.user)
    const cart = await this.cartService.getUserCart(request.user)
    const coursesIds = await this.cartService.getCartCoursesIds(request.user)
    await this.cartService.enrolledInCourses(request.user, coursesIds)
    try{
      await TalentLMS.Users.setStatus(request.user.lms_id, 'active')
    }catch (error) {
      throw new BadRequestException('Service unavailable at the moment')
    }
    await this.studentService.isSufficient(request.user, cart.amount)
    //Wallet payment
    if(paymentMethod === 'wallet'){
      const courses = await this.cartService.getCourses(coursesIds)
      let transactionAmount = 0
      for (const course of courses.toJSON()) {
        //adding user to branch with ignoring the exception as fails if user already in the branch
        try {
          await TalentLMS.Branches.addUsertoBranch(course.classroom.instructor.branch_id, request.user.lms_id)
        } catch (error) {}
        //enroll user to course with catching exception if the user failed to enroll in talent lms
        try{
          await TalentLMS.Courses.addUserToCourse({user_id: request.user.lms_id, course_id: course.lms_id, role: 'learner'})
        }catch (error){
          const enrolledInLms = await this.classroomService.enrolledInLms(request.user, course)
          if (enrolledInLms) {
            await this.classroomService.enrollInCourses(request.user, [course.id])
            continue
          }
          const trx = await this.transactionService.createWalletTrx(transactionAmount)
          await this.invoiceService.createWalletInvoice(trx, request.user.id, 'purchase')
          await this.cartService.flushCart(cart)
          console.error('Failure in checkout single course error: ')
          console.error(error)
          // add purchase log
          await this.studentService.addPurchaseTimelineLog(request.user, course)
          return Http.sendResponse(response, true, null, 'successful purchase')
        }
        transactionAmount += course.price
        await this.classroomService.enrollInCourses(request.user, course.id)
        // add purchase log
        await this.studentService.addPurchaseTimelineLog(request.user, course)
      }
      const trx = await this.transactionService.createWalletTrx(transactionAmount)
      const invoice = await this.invoiceService.createWalletInvoice(trx, request.user.id, 'purchase')
      await invoice.courses().attach(coursesIds)
      //deducting amount from wallet if the enrollment is successful with specifying the reason for debugging
      await this.studentService.deductFromWallet(request.user, invoice.price, invoice, `Purchase one or more courses`)
      await this.cartService.flushCart(cart)
      return Http.sendResponse(response, true, null, 'successful purchase')
    }
    //Cash collection payment
    const refNumber = await Helpers.generateToken(10)
    const orderResponse = await AcceptCash.registerOrder(refNumber, [], cart.amount *100)
    const trx = await this.transactionService.create( {
      transaction_ref: refNumber,
      status: 'pending',
      method: 'CASHCOLLECT',
      amount: cart.amount,
      expiry_date: Helpers.expiryTime(0),
      provider: 'ACCEPT',
      provider_ref: orderResponse.id
    })
    const invoice = await this.invoiceService.create({
      transaction_id: trx.id,
      user_id: request.user.id,
      invoice_ref: trx.transaction_ref,
      invoice_date: Helpers.now(),
      total_price: trx.amount,
      price: trx.amount, //TODO to be revisited on accept integration
      type: 'purchase',
      status: 'pending'
    })
    const paymentKey = await AcceptCash.requestPaymentKey(trx, request.user, null)
    const payRequest = await AcceptCash.payRequest(paymentKey.token)
    return Http.sendResponse(response, true, payRequest, 'Waiting cash collection')
  }

  async checkoutSingleCourse({request, response}){
    const paymentMethod = request.input('payment_method')
    const course = await this.classroomService.getCourseByIdOrFail(request.input('course_id'))
    const enrolledInLms = await this.classroomService.enrolledInLms(request.user, course)
    try{
      await TalentLMS.Users.setStatus(request.user.lms_id, 'active')
    }catch (error) {
      throw new BadRequestException('Service unavailable at the moment')
    }
    try{
      await this.cartService.enrolledInCourse(request.user, request.input('course_id'))
      if (enrolledInLms){
        await this.classroomService.enrollInCourses(request.user, [request.input('course_id')])
        // add purchase log
        await this.studentService.addPurchaseTimelineLog(request.user, course)
        return Http.sendResponse(response, true, null, 'Course purchased successfully')
      }
    }catch (error) {
      if (!enrolledInLms){
        await TalentLMS.Courses.addUserToCourse({user_id: request.user.lms_id, course_id: course.lms_id, role: 'learner'})
      }
      throw error
    }
    if(!course.status)
      throw new ForbiddenException('Course is not active')
    const classroom = await course.classroom().first()
    const instructor = await classroom.instructor().first()
    //Wallet payment
    if(paymentMethod === 'wallet'){
      await this.studentService.isSufficient(request.user, course.price)
      try{
        await TalentLMS.Users.setStatus(request.user.lms_id, 'active')
      }catch (error) {
        throw new BadRequestException('Service unavailable at the moment')
      }      //adding user to branch with ignoring the exception as fails if user already in the branch
      try{
        await TalentLMS.Branches.addUsertoBranch(instructor.branch_id, request.user.lms_id)
      }catch (error) {}
      //enroll user to course with catching exception if the user failed to enroll in talent lms
      try {
        await TalentLMS.Courses.addUserToCourse({user_id: request.user.lms_id, course_id: course.lms_id, role: 'learner'})
        await this.classroomService.enrollInCourses(request.user, [request.input('course_id')])
      }catch (error) {
        console.error('Failure in checkout single course error: ')
        console.error(error)
        throw new BadRequestException(`Failed to enroll ${error.message}`)
      }
      const trx = await this.transactionService.createWalletTrx(course.price)
      const invoice = await this.invoiceService.createWalletInvoice(trx, request.user.id, 'purchase')
      await invoice.courses().attach([request.input('course_id')])
      //deducting amount from wallet if the enrollment is successful with specifying the reason for debugging
      await this.studentService.deductFromWallet(request.user, invoice.price, invoice, `Purchase course ${course.name}`)
      // add purchase log
      await this.studentService.addPurchaseTimelineLog(request.user, course)
      return Http.sendResponse(response, true, null, 'Course purchased successfully')
    }else{
      throw new ForbiddenException('Invalid method')
    }
  }
}

module.exports = CheckoutController
