'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Permission extends Model {

    permissions(){
        return this.belongsToMany('App/Models/Admin', 'permission_id', 'admin_id', 'id', 'id').pivotTable('admin_permissions').pivotModel('App/Models/AdminPermission')
      }
}

module.exports = Permission
