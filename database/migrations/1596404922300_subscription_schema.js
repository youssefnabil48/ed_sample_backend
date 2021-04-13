'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SubscriptionSchema extends Schema {
  up() {
    this.create('subscriptions', (table) => {
      table.integer('user_id').unsigned().notNullable();
      table.integer('classroom_id').unsigned().notNullable();
      table.enum('type', ['week', 'month', 'onGround']).notNullable();
      table.float('quota').notNullable();
      table.timestamps();

      table.primary(['user_id', 'classroom_id']);
      table.foreign('user_id').references('user_id').inTable('students').onDelete('CASCADE');
      table.foreign('classroom_id').references('id').inTable('classrooms').onDelete('CASCADE');
    })
  }

  down() {
    this.drop('subscriptions')
  }
}

module.exports = SubscriptionSchema
