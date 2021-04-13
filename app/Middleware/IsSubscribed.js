'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Subscription = use('App/Models/Subscription')
const ConflictException = use('App/Exceptions/ConflictException')

class IsSubscribed {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request }, next) {
    const sub = await Subscription.query().where({user_id: request.user.id, classroom_id: request.input('classroom_id')}).first()
    if(sub)
      throw new ConflictException('User is already subscribed')
    // call next to advance the request
    await next()
  }
}

module.exports = IsSubscribed
