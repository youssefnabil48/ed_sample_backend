'use strict'

const ResourceNotFoundException = use('App/Exceptions/ResourceNotFoundException')
const ConflictException = use('App/Exceptions/ConflictException')
const Codes = use('App/Constants/Codes')
const _ = use('lodash')
const Course = use('App/Models/Course')
const Subscription = use('App/Models/Subscription')
const EnrollCourse = use('App/Models/EnrollCourse')
const CustomException = use('App/Exceptions/CustomException')
const ClassroomService = use('App/Services/Classroom/ClassroomService')
const BadRequestException = use("App/Exceptions/BadRequestException")

class CartService {

  async getUserCart(user) {
    return user.cart().with('courses.classroom.instructor.user').with('courses.classroom.category').first()
  }

  async addToCart(user, coursesIds) {
    await this.activeCourses(coursesIds)
    //check if the user ins enrolled in one of the courses in db
    await this.enrolledInCourses(user, coursesIds)
    const courses = await this.getCourses(coursesIds)
    const classroomService = new ClassroomService()
    //check if the user in enrolled in talent lms
    for (const course of courses.toJSON()) {
      const enrolledInLms = await classroomService.enrolledInLms(user, course)
      if (enrolledInLms) {
        await this.enrolledInCourse(user, course.id)
        throw new BadRequestException(`Already enrolled in ${course.name}`)
      }
    }
    try {
      const cart = await user.cart().first()
      await cart.courses().attach(coursesIds);
      return this.updateCartPrice(cart);
    } catch (error) {
      if (Number(error.code) === Number(Codes.Error.Database.foreignKeyViolation))
        throw new ResourceNotFoundException('Cannot find target courses');
      throw error
    }
  }

  async removeFromCart(user, coursesIds) {
    try {
      const cart = await user.cart().first()
      await cart.courses().detach(coursesIds);
      return this.updateCartPrice(cart);
    } catch (error) {
      if (Number(error.code) === Number(Codes.Error.Database.foreignKeyViolation))
        throw new ResourceNotFoundException('Cannot find target courses');
      throw error
    }
  }

  async updateCartPrice(cart) {
    const cartCourses = await cart.courses().fetch()
    cart.amount = _.sumBy(cartCourses.toJSON(), 'price')
    await cart.save()
  }

  async flushCart(cart) {
    await cart.courses().detach()
    cart.amount = 0;
    await cart.save();
  }

  async cartCourses(user) {
    const cart = await user.cart().first()
    return cart.courses().fetch()
  }

  async getCartCoursesIds(user) {
    const cart = await user.cart().first()
    const courses = await cart.courses().fetch()
    return _.map(courses.toJSON(), 'id')
  }

  async subscribedToClassrooms(user, courseIds) {
    const classroomIds = _.uniq((await Course.query().select('classroom_id').whereIn('id', courseIds).fetch()).toJSON().map(course => course.classroom_id))
    const rows = (await Subscription.query().where('user_id', user.id).whereIn('classroom_id', classroomIds).fetch()).toJSON()
    if (classroomIds.length !== rows.length) {
      throw new ConflictException('You have to subscribe to this classroom first')
    }
  }

  async enrolledInCourses(user, courseIds) {
    const rows = await EnrollCourse.query().where('user_id', user.id).whereIn('course_id', courseIds).fetch()
    if (rows.toJSON().length) {
      throw new ConflictException('User already enrolled at least one of these courses')
    }
  }

  async enrolledInCourse(user, courseId) {
    const rows = await EnrollCourse.query().where('user_id', user.id).where('course_id', courseId).first()
    if (rows) {
      throw new ConflictException('User already enrolled in this course')
    }
  }

  async activeCourses(courseIds) {
    const activeCourses = (await Course.query().where('status', true).whereIn('id', courseIds).fetch()).toJSON()
    if (activeCourses.length !== courseIds.length) {
      throw new ConflictException('Course Inactive')
    }
  }

  async isEmpty(user) {
    const cart = await user.cart().first()
    if ((await cart.courses().fetch()).toJSON().length === 0) {
      throw new CustomException('Cart is empty')
    }
  }

  async getCourses(courseIds) {
    return Course.query().with('classroom.instructor').whereIn('id', courseIds).fetch()
  }
}

module.exports = CartService
