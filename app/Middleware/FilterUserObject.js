'use strict';
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const _ = use('lodash');

class FilterUserObject {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle({request}, next) {
    // call next to advance the request
    request.body = _.pick(request.body,
      ['first_name', 'middle_name', 'last_name',
        'gender', 'profile_photo', 'birth_date', 'address', 'student', 'instructor']);
    request.body.address = _.omit(request.body.address,
      ['user_id', 'created_at', 'updated_at']);
    request.body.student = _.omit(request.body.student,
      ['user_id', 'profile_login', 'profile_buy', 'created_at', 'updated_at']);
    request.body.instructor = _.omit(request.body.instructor,
      ['user_id', 'tid', 'branch_id', 'branch_name', 'created_at', 'updated_at']);

    await next();
  }
}

module.exports = FilterUserObject;
