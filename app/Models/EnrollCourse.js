'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class EnrollCourse extends Model {
  static get primaryKey() {
    return ['course_id', 'user_id'];
  }
}

module.exports = EnrollCourse
