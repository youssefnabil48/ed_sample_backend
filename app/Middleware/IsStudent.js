'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const ForbiddenException = use('App/Exceptions/ForbiddenException');

class IsStudent {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request , auth}, next) {
    if(!auth.jwtPayload.data.type.includes('student'))
      throw new ForbiddenException('Only Students Are Authorized');
    await next()
  }
}

module.exports = IsStudent
