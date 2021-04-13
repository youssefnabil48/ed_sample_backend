'use strict'

const Helpers = use('App/Helpers/Helpers');
const UserService = use('App/Services/User/UserService');
const Student = use('App/Models/Student');
const User = use('App/Models/User');
const Address = use('App/Models/Address');
const WalletLog = use('App/Models/WalletLog');
const CustomException = use('App/Exceptions/CustomException')
const _ = use('lodash')
const ResourceNotFoundException = use('App/Exceptions/ResourceNotFoundException')
const TalentLMS = use('TalentLms')
const moment = use('moment')
const Database = use('Database')
const Cache = use('Cache')

class StudentService extends UserService {
  constructor() {
    super();
  }

  async findBy(field, value) {
    const student = await User.query().where(field, value).whereHas('student').first()
    if (!student)
      throw new ResourceNotFoundException('User not found')
    return student
  }

  async findStudentForParentOrFail(phone, username){
    const student = await Student.query().where('parent1_phone', phone).orWhere('parent2_phone', phone).first()
    if(!student){
      throw new ResourceNotFoundException('Invalid parent phone')
    }
    const user = await student.user().first()
    if(user.username !== username){
      throw new CustomException('Invalid username', 400)
    }
    user.student = student
    return user
  }

  async create(user) {
    const newUser = await super.createUser(user);
    const student = await newUser.student().create({})
    await student.wallet().create({})
    await student.cart().create({})
    await student.address().create({})
    return newUser
  }

  async updateStudentProfile(id, userObj) {
    let {student, instructor, address, ...user} = userObj
    await User.query().where('id', id).update(user)
    await Student.query().where('user_id', id).update(student)
    if (Object.keys(address).length) {
      if (await Address.query().where('user_id', id).first()) {
        await Address.query().where('user_id', id).update(address)
      } else {
        await Address.create(Object.assign({}, address, {user_id: id}))
      }
    }
  }

  async completeStudentLoginProfile(id, userObj) {
    await this.updateStudentProfile(id, userObj)
    await Student.query().where('user_id', id).update({profile_login: true})
  }

  async completeStudentBuyProfile(id, obj) {
    let {address, ...profile} = obj;
    await Student.query().where('user_id', id).update(Object.assign({}, profile, {profile_buy: true}))
    const user = await User.query().with('student').where('id', id).first()
    if (!user.lms_id) return
    try {
      await TalentLMS.Users.editUserCustomFields({
        user_id: user.lms_id,
        custom_field_1: user.phone_number,
        custom_field_2: user.student.parent1_name,
        custom_field_3: user.student.parent1_phone,
        custom_field_4: user.student.parent2_name,
        custom_field_5: user.student.parent2_phone,
      })
    } catch (error) {
      console.log(`error on updating user parental info user.id: ${user.id}, username: ${user.username}`)
    }
  }

  async isSufficient(user, price) {
    const wallet = await user.wallet().first()
    if (!(Number(wallet.amount) >= Number(price))) {
      throw new CustomException('Insufficient Wallet Amount')
    }
    return wallet
  }

  async addToWallet(user, amount, invoice=null, reason = null, refund=false, system = false) {
    if (invoice && Number(amount) !== Number(invoice.price)){
      console.log('Amount does not equal invoice price')
      throw new CustomException('Server Error', 500)
    }
    const wallet = await user.wallet().first()
    const newAmount = wallet.amount + amount
    // add wallet log
    await user.walletLogs().create({
      old_amount: wallet.amount,
      amount: amount,
      new_amount: newAmount,
      description: reason,
      invoice_id: invoice? invoice.id : null
    })
    wallet.amount = newAmount;
    await wallet.save();
    //add timeline log if not admin
    if(!system)
    await this.addRechargeTimelineLog(user, amount, refund)
  }

  async deductFromWallet(user, amount, invoice = null, reason = null) {
    if (invoice && Number(amount) !== Number(invoice.price)){
      console.log('Amount does not equal invoice price')
      throw new CustomException('Server Error', 500)
    }
    const wallet = await this.isSufficient(user, amount)
    const newAmount = wallet.amount - amount
    // add wallet log
    await user.walletLogs().create({
      old_amount: wallet.amount,
      amount: -amount,
      new_amount: newAmount,
      description: reason,
      invoice_id: invoice? invoice.id : null
    })
    wallet.amount = newAmount;
    await wallet.save()
  }

  async addSubscribeTimelineLog(user, classroom, plan) {
    // add timeline log
    await user.timelineLogs().create({
      event: 'classroom subscription',
      tag: 'subscribe',
      description: `Classroom ${classroom.title} ${plan}ly subscription.`
    })
  }

  async addRenewTimelineLog(user, classroom, plan) {
    // add timeline log
    await user.timelineLogs().create({
      event: 'subscription renewal',
      tag: 'renew',
      description: `Classroom ${classroom.title} ${plan}ly subscription renewal.`
    })
  }

  async addCancelTimelineLog(user, classroom, plan) {
    // add timeline log
    await user.timelineLogs().create({
      event: 'subscription cancellation',
      tag: 'cancel',
      description: `Classroom ${classroom.title} ${plan}ly subscription cancellation.`
    })
  }

  async addPurchaseTimelineLog(user, course) {
    // add timeline log
    await user.timelineLogs().create({
      event: 'wallet course purchase',
      tag: 'purchase',
      description: `Purchase course ${course.name}.`
    })
  }

  async addScratchcardTimelineLog(user, course, code) {
    // add timeline log
    await user.timelineLogs().create({
      event: 'code course purchase',
      tag: 'code',
      description: `Purchase course ${course.name} with code ${code}.`
    })
  }

  async addRechargeTimelineLog(user, amount, refund=false) {
    // add timeline log
    if(refund){
      await user.timelineLogs().create({
        event: 'wallet refund',
        tag: 'refund',
        description: `Wallet refund with ${amount} EGP.`
      })
    }else{
      await user.timelineLogs().create({
        event: 'wallet recharge',
        tag: 'recharge',
        description: `Wallet recharge with ${amount} EGP.`
      })
    }
  }

  async getAllInvoices(user, filters, from, to) {
    const invoiceQuery = user.invoices().with('transaction')
      .with('courses.classroom').orderBy('created_at', 'desc')
    if (filters){
      filters.forEach(filter => {
        if(Object.keys(filter).includes('method')){
          invoiceQuery.whereHas('transaction', (builder) => {
            builder.where(filter)
          })
        }else {
          invoiceQuery.where(filter)
        }
      })
    }
    if(from) invoiceQuery.where(Database.raw('DATE(invoices.created_at)'), '>=', moment(from, 'YYYY/MM/DD').format('YYYY-MM-DD'))
    if(to) invoiceQuery.where(Database.raw('DATE(invoices.created_at)'), '<=', moment(to, 'YYYY/MM/DD').format('YYYY-MM-DD'))
    return invoiceQuery.fetch()
  }

  async getSubscribedClassrooms(user) {
    const student = await user.student().first()
    return student.classrooms().with('instructor.user').fetch()
  }

  async getPurchasedCourses(user) {
    const student = await user.student().first()
    const classroomsIds = _.map((await student.classrooms().fetch()).rows, (classroom) => classroom.id)
    // return _.filter((await student.courses().with('classroom.instructor.user').with('classroom.category').fetch()).toJSON(), course => !classroomsIds.includes(course.classroom_id))
    let lmsEnrolled = null
    try {
      lmsEnrolled = await Cache.remember('student:'+user.username, 5, async () => {
        return await TalentLMS.Users.getUserById(user.lms_id);
      })
    }catch (error) {
      throw new CustomException('Error getting enrolled courses information')
    }
    // get user enrolled courses in classroom from DB
    let enrolledCourses = await student.courses().with('classroom.instructor.user').with('classroom.category').fetch()
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
    enrolledCourses = _.filter(enrolledCourses.toJSON(), course => !classroomsIds.includes(course.classroom_id))
    return enrolledCourses
  }

  async getStudentProgressInCourse(user, course) {
    try {
      return await TalentLMS.Courses.getUserStatusInCourse(course.lms_id, user.lms_id)
    } catch (error) {
      return error.message
    }
  }
}

module.exports = StudentService;
