'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ClassroomSchema extends Schema {
  up() {
    this.create('classrooms', (table) => {
      table.increments();
      table.integer('instructor_id').unsigned().notNullable()
      table.integer('category_id').unsigned()
      table.string('lms_id').unique()
      table.string('lms_name').unique()
      table.boolean('status').notNullable().defaultTo(false)
      table.integer('current_course').unsigned()
      table.text('title').notNullable();
      table.string('label').notNullable().unique()
      table.enum('type',['online', 'onGround'])
      table.text('description').notNullable();
      table.text('prerequisite');
      table.float('price').notNullable();
      table.float('rating').notNullable().defaultTo(0);
      table.integer('rating_count').notNullable().defaultTo(0);
      table.integer('enrolled_count').notNullable().defaultTo(0);
      table.string('language');
      table.text('thumbnail');
      table.integer('duration');
      table.timestamps();

      table.foreign('instructor_id').references('user_id').inTable('instructors');
      table.foreign('category_id').references('id').inTable('categories');
    })
  }

  down() {
    this.drop('classrooms')
  }
}

module.exports = ClassroomSchema
