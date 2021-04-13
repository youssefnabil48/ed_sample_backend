'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const RedirectionException = use('App/Exceptions/RedirectionException')
const Codes = use('App/Constants/Codes');

class IsVerifiedAccount {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle({request}, next) {
    const student = await request.user.student().first()
    let redirectCode = null
    let message = null
    // if(!(request.user.phone_verified)){
    //   redirectCode = Codes.Error.Redirect.phoneVerification
    //   message = 'Phone is not verified'
    // }
    if (!(request.user.email_verified)) {
      redirectCode = Codes.Error.Redirect.emailVerification
      message = 'Email is not verified'
    }
    if (!(student.profile_login)) {
      redirectCode = Codes.Error.Redirect.completeLoginProfile
      message = 'Please complete your profile first'
    }
    if (!(student.profile_buy)) {
      redirectCode = Codes.Error.Redirect.completePurchaseProfile
      message = 'Please complete your profile first'
    }
    if (redirectCode)
      throw new RedirectionException(message, 403, redirectCode);
    await next()
  }
}

module.exports = IsVerifiedAccount
