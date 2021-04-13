'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NewsFeedSchema extends Schema {
  up () {
    this.create('news_feeds', (table) => {
      table.increments()
      table.text('content')
      table.string('photo')
      table.string('description')
      table.string('redirection_url')
      table.boolean('is_active').defaultTo(false)
      table.timestamps()
    })
  }

  down () {
    this.drop('news_feeds')
  }
}

module.exports = NewsFeedSchema
