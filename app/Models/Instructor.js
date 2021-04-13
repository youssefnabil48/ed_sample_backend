'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Instructor extends Model {
  static get primaryKey() {
    return 'user_id';
  }

  static get hidden() {
    return ['user_id'];
  }

  user() {
    return this.belongsTo('App/Models/User')
  }

  classrooms() {
    return this.hasMany('App/Models/Classroom', 'user_id', 'instructor_id');
  }

  certifications() {
    return this.hasMany('App/Models/Certification', 'user_id', 'user_id');
  }

  experiences() {
    return this.hasMany('App/Models/Experience','user_id', 'user_id');
  }
}

module.exports = Instructor
