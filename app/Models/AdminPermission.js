'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class AdminPermission extends Model {
    static get primaryKey() {
        return null;
    }
}

module.exports = AdminPermission
