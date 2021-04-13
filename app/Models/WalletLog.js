'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class WalletLog extends Model {
  static get primaryKey() {
    return 'id';
  }

  static get dates () {
    return super.dates.concat(['timestamp'])
  }

  user() {
    return this.belongsTo('App/Models/User');
  }

  invoice(){
    return this.belongsTo('App/Models/Invoice');
  }
}

module.exports = WalletLog
