'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const RedirectionException = use('App/Exceptions/RedirectionException')
const Codes = use('App/Constants/Codes');

class IsPhoneVerified {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request }, next) {
    if(!(request.user.phone_verified))
      throw new RedirectionException('Please verify your Phone first', 403, Codes.Error.Redirect.phoneVerification);
    await next()
  }
}

module.exports = IsPhoneVerified
