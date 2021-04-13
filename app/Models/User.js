'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

class User extends Model {

  static get primaryKey() {
    return 'id';
  }

  static get hidden() {
    return ['id', 'password', 'password_reset_token'];
  }

  // User Relations
  student() {
    return this.hasOne('App/Models/Student');
  }

  instructor() {
    return this.hasOne('App/Models/Instructor');
  }

  verifications() {
    return this.hasMany('App/Models/Verification');
  }

  // Instructor Relations
  certifications() {
    return this.manyThrough('App/Models/Instructor', 'certifications', 'id', 'user_id');
  }

  experiences() {
    return this.manyThrough('App/Models/Instructor', 'experiences', 'id', 'user_id');
  }

  // Student Relations
  wallet() {
    return this.manyThrough('App/Models/Student', 'wallet', 'id', 'user_id');
  }

  cart() {
    return this.manyThrough('App/Models/Student', 'cart', 'id', 'user_id');
  }

  addresses() {
    return this.manyThrough('App/Models/Student', 'address', 'id', 'user_id');
  }

  ips() {
    return this.manyThrough('App/Models/Student', 'ips', 'id', 'user_id');
  }

  trustedDevices() {
    return this.manyThrough('App/Models/Student', 'trustedDevices', 'id', 'user_id');
  }

  creditcards() {
    return this.manyThrough('App/Models/Student', 'creditcards', 'id', 'user_id');
  }

  courses() {
    return this.manyThrough('App/Models/Student', 'courses', 'id', 'user_id');
  }

  classrooms() {
    return this.manyThrough('App/Models/Student', 'classrooms', 'id', 'user_id');
  }

  reviews() {
    return this.manyThrough('App/Models/Student', 'reviews', 'id', 'user_id');
  }

  invoices() {
    return this.manyThrough('App/Models/Student', 'invoices', 'id', 'user_id');
  }

  transactions() {
    return this.manyThrough('App/Models/Student', 'transactions', 'id', 'user_id');
  }

  walletLogs(){
    return this.hasMany('App/Models/WalletLog');
  }

  timelineLogs(){
    return this.hasMany('App/Models/Timeline');
  }


  static boot() {
    super.boot()

    /**
     * A hook to hash the User password before saving
     * it to the database.
     */
    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }
}

module.exports = User
