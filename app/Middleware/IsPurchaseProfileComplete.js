'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const RedirectionException = use('App/Exceptions/RedirectionException')
const Codes = use('App/Constants/Codes');

class IsPurchaseProfileComplete {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request }, next) {
    const student = await request.user.student().first()
    if(!(student.profile_buy))
      throw new RedirectionException('Please complete your profile first', 403, Codes.Error.Redirect.completePurchaseProfile);
    await next()
  }
}

module.exports = IsPurchaseProfileComplete
