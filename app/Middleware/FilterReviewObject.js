'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const _ = use('lodash');

class FilterReviewObject {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request , auth}, next) {
    request.body.review = _.pick(request.body, ['rating', 'comment']);
    await next();
  }
}

module.exports = FilterReviewObject
