'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class RequestUser {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request, auth }, next) {
    try {
      if (await auth.check())
        request.user = await auth.getUser()
      await next()
    }catch (e) {
      await next()
    }
  }
}

module.exports = RequestUser
