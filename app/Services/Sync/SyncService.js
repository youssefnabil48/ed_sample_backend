'use strict'

const ClassroomService = use('App/Services/Classroom/ClassroomService')
const TalentLMS = use('TalentLms')
const Classroom = use('App/Models/Classroom')
const Course = use('App/Models/Course')
const Unit = use('App/Models/Unit')
const User = use('App/Models/User')
const EnrollCourse = use('App/Models/EnrollCourse')
const Subscription = use('App/Models/Subscription')
const TransactionService = use('App/Services/Invoice/TransactionService')
const InvoiceService = use('App/Services/Invoice/InvoiceService')
const Mail = use('App/Helpers/Mail')
const Messages = use('App/Constants/Messages')
const StudentService = use('App/Services/User/StudentService')


class SyncService {

  constructor() {
    this.classroomService = new ClassroomService()
    this.transactionService = new TransactionService()
    this.invoiceService = new InvoiceService()
    this.studentService = new StudentService()
  }

  async getLmsCourses() {
    return TalentLMS.Courses.getCourses()
  }

  async updateCourses(lmsCourses) {
    for (const lmsCourse of lmsCourses) {
      console.log(`looping on course ${lmsCourse.code} ${lmsCourse.name}`)
      const course = await Course.findBy('lms_id', lmsCourse.id)
      if (course) {
        console.log(`course ${lmsCourse.code} ${lmsCourse.name} found`)
        course.status = lmsCourse.status === 'active';
        course.code = lmsCourse.code
        course.name = lmsCourse.name
        await course.save()
      } else {
        console.log(`course ${lmsCourse.code} not found getting classroom`)
        const classroom = await Classroom.query().whereNotNull('lms_id').where('lms_id', lmsCourse.category_id).first()
        if (!classroom) {
          // Send Data Integrity Issue Report
          await Mail.sendEmail("marwanamrhuss@gmail.com", "Integrity issue report", Messages.email.body.NotificationEmail("Marwan", `
          Did not find LMS course in our DB, Hence tried to find if it belongs to a classroom and failed, classroom id in Talent LMS: ${lmsCourse.category_id}`));
          continue
        }
        console.log(`creating classroom with lms_id ${lmsCourse.code} ${lmsCourse.name}`)
        await Course.create({
          id: (await Course.query().max('id'))[0].max+1,
          lms_id: lmsCourse.id,
          classroom_id: classroom.id,
          name: lmsCourse.name,
          description: lmsCourse.description,
          price: lmsCourse.price.substring(5),
          number: (await Course.query().where('classroom_id', classroom.id).max('number'))[0].max + 1,
          code: lmsCourse.code,
          status: lmsCourse.status === 'active'
        })
      }
      console.log(`updating course units.....`)
      await this.updateCourseUnits(lmsCourse)
    }
    return true
  }

  async updateCourseUnits(lmsCourse) {
    let lmsCourseObj = await TalentLMS.Courses.getCourse(lmsCourse.id)
    //loop on this course's units
    for (const lmsUnit of lmsCourseObj.units) {
      console.log(`looping on units ${lmsUnit.id} ${lmsUnit.name}`)
      const unit = await Unit.findBy('lms_id', lmsUnit.id)
      if (!unit) {
        console.log(`unit not found`)
        const course = await Course.findBy('lms_id', lmsCourse.id)
        console.log(`creating new unit`)
        await Unit.create({
          lms_id: lmsUnit.id,
          course_id: course.id,
          type: lmsUnit.type,
          name: lmsUnit.name,
          url: lmsUnit.url
        })
        continue
      }
      console.log(`updating unit ${lmsUnit.id} ${lmsUnit.name}`)
      unit.type = lmsUnit.type
      unit.name = lmsUnit.name
      unit.url = lmsUnit.url
      await unit.save()
    }
    return true
  }

  async updateCurrentActiveCourse() {
    const classrooms = await Classroom.all()
    for (const classroom of classrooms.rows) {
      console.log(`looping on classroom ${classroom.title}`)
      const currentCourse = await Course.query().where('status', true).where('classroom_id', classroom.id).orderBy('number', 'desc').first()
      if (currentCourse && classroom.current_course !== currentCourse.id) {
        classroom.current_course = currentCourse.id
        await classroom.save()
        console.log(`current course changed enrolling subscribed students......`)
        if(classroom.type === 'online'){
          await this.enrollSubscribedStudents(classroom)
        }
      }
    }
    return true
  }

  async enrollSubscribedStudents(classroom) {
    const subscriptions = await Subscription.query().where('classroom_id', classroom.id).whereNot({type: 'onGround'}).fetch()
    console.log(`getting subscriptions for classroom ${classroom.id}`)
    for (const subscription of subscriptions.rows) {
      console.log(`looping on subscription ${JSON.stringify(subscription)}`)
      const user = await User.query().where('id', subscription.user_id).first()
      const wallet = await user.wallet().first()
      //check if user is already enrolled in the course
      console.log(`checking if the user is already enrolled`)
      const isEnrolled = await EnrollCourse.query().where('user_id', user.id).where('course_id', classroom.current_course).first()
      if (isEnrolled) continue
      switch (subscription.type) {
        case 'week':
          console.log(`CASE: weekly subscription`)
          //check if user doesn't have enough funds in the wallet
          // decide what to make with insufficient amounts
          if (wallet.amount < classroom.price) {
            console.log(`The user ${user.username} doesn't have enough funds skipping`)
            await Mail.sendEmail(user.email, "Subscription Renewal Failure", Messages.email.body.NotificationEmail(user.first_name, `
            We did not find enough money in your wallet in order to renew your subscription to ${classroom.title} classroom,
            Therefore, your subscription will be cancelled and no new content will be opened to you before recharging your wallet with the required amount which is ${classroom.price} EGP for your current ${subscription.type}ly subscription plan. and then you can subscribe again to the classroom.`));
            await subscription.delete()
            //add cancel log
            await this.studentService.addCancelTimelineLog(user, classroom, subscription.type)
            continue
          }
          //create wallet invoice and corresponding transaction
          console.log(`creating transaction and invoices`)
          const trx = await this.transactionService.createWalletTrx(classroom.price)
          const invoice = await this.invoiceService.createWalletInvoice(trx, user.id, 'subscribe')
          await invoice.courses().attach([classroom.current_course])
          //deduct the subscription fees from wallet
          const studentService = new StudentService()
          await studentService.deductFromWallet(user, invoice.price, invoice, `${classroom.title} weekly subscription renewal`)
          //enroll user to course in db
          console.log(`enrolling user into database`)
          await EnrollCourse.create({user_id: user.id, course_id: classroom.current_course})
          // IMPORTANT Enroll User In Talent lms
          console.log(`getting current course`)
          const current_course = await Course.find(classroom.current_course)
          console.log(`enrolling user into the course in talent lms`)
          await TalentLMS.Courses.addUserToCourse({user_id: user.lms_id, course_id: current_course.lms_id, role: 'learner'})
          //add renew log
          await this.studentService.addRenewTimelineLog(user, classroom, subscription.type)
          break
        case 'month':
          console.log(`CASE: monthly subscription`)
          //check if user has quota in subscription
          if (subscription.quota >= classroom.price) {
            console.log(`user have enough quota in his subscription`)
            //deduct the weekly price from quota
            const student = await user.student().first()
            await student.classrooms().pivotQuery().where('classroom_id', classroom.id).update({quota: subscription.quota - classroom.price})
            console.log(`enrolling user into database`)
            //enroll user to course in local db
            await EnrollCourse.create({user_id: user.id, course_id: classroom.current_course})
            // IMPORTANT Enroll user in talent lms
            console.log(`enrolling user into the course in talent lms`)
            const current_course = await Course.find(classroom.current_course)
            await TalentLMS.Courses.addUserToCourse({user_id: user.lms_id, course_id: current_course.lms_id, role: 'learner'})
          } else {  //quota is less than the classroom price
            //check if user doesn't has enough fund to renew subscription
            console.log(`no enough quota in his monthly subscription checking user wallet for renewal`)
            if (wallet.amount < classroom.price * 4) {
              console.log(`user doesn't have enough funds to renew his monthly subscription skipping and sending mail.....`)
              await Mail.sendEmail(user.email, "Subscription Renewal Failure", Messages.email.body.NotificationEmail(user.first_name, `
              We did not find enough money in your wallet in order to renew your subscription to ${classroom.title} classroom,
              Therefore, your subscription will be cancelled and no new content will be opened to you before recharging your wallet with the required amount which is ${classroom.price * 4} EGP for your current ${subscription.type}ly subscription plan.`));
              // add cancel log
              await this.studentService.addCancelTimelineLog(user, classroom, subscription.type)
              await subscription.delete()
              continue
            } //skip due to insufficient fund
            //create wallet invoice and corresponding transaction
            console.log(`creating transaction and invoices`)
            const trx = await this.transactionService.createWalletTrx(classroom.price * 4)
            const invoice = await this.invoiceService.createWalletInvoice(trx, user.id, 'subscribe')
            await invoice.courses().attach([classroom.current_course])
            //deduct amount from wallet
            const studentService = new StudentService()
            await studentService.deductFromWallet(user, invoice.price, invoice, `${classroom.title} monthly subscription renewal`)
            //updating new subscription quota
            const student = await user.student().first()
            await student.classrooms().pivotQuery().where('classroom_id', classroom.id).update({quota: subscription.quota + classroom.price * 3})
            //enroll user to course in local db
            console.log(`enrolling user into database`)
            await EnrollCourse.create({user_id: user.id, course_id: classroom.current_course})
            // IMPORTANT Enroll user in talent lms
            console.log(`enrolling user into the course in talent lms`)
            const current_course = await Course.find(classroom.current_course)
            await TalentLMS.Courses.addUserToCourse({user_id: user.lms_id, course_id: current_course.lms_id, role: 'learner'})
            //add renew log
            await this.studentService.addRenewTimelineLog(user, classroom, subscription.type)
          }
          break
        case 'onGround':
          continue
        default:
          // Send Data Integrity Issue Report
          await Mail.sendEmail("marwanamrhuss@gmail.com", "Integrity issue report", Messages.email.body.NotificationEmail("Marwan", `
          subscription type not correct: ${subscription.type}`));

      }

    }
  }

}

module.exports = SyncService
