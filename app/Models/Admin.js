'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

class Admin extends Model {
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

  permissions(){
    return this.belongsToMany('App/Models/Permission', 'admin_id', 'permission_id', 'id', 'id').pivotTable('admin_permissions').pivotModel('App/Models/AdminPermission')
  }

  logs(){
    return this.hasMany('App/Models/AdminLog')
  }
}

module.exports = Admin
