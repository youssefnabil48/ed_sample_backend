'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const RedirectionException = use('App/Exceptions/RedirectionException')
const Codes = use('App/Constants/Codes');

class IsEmailVerified {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request }, next) {
    if(!(request.user.email_verified))
      throw new RedirectionException('Please verify your email', 403, Codes.Error.Redirect.emailVerification);
    await next()
  }
}

module.exports = IsEmailVerified
