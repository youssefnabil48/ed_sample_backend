'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AdminPermissionSchema extends Schema {
  up () {
    this.create('admin_permissions', (table) => {
      table.integer('admin_id').unsigned().notNullable();
      table.integer('permission_id').unsigned().notNullable();
      table.timestamps();

      table.primary(['admin_id', 'permission_id']);
      table.foreign('admin_id').references('id').inTable('admins').onDelete('CASCADE');
      table.foreign('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
    })
  }

  down () {
    this.drop('admin_permissions')
  }
}

module.exports = AdminPermissionSchema
