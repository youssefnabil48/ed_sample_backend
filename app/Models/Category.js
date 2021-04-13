'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Category extends Model {
  static get primaryKey() {
    return 'id';
  }

  classrooms() {
    return this.hasMany('App/Models/Classroom');
  }

  category() {
    return this.hasOne('App/Models/Category', 'parent_id', 'id');
  }

  category() {
    return this.belongsTo('App/Models/Category', 'id', 'parent_id');
  }
}

module.exports = Category
