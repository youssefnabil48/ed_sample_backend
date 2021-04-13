'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

class BadRequestException extends LogicalException {
  /**
   * Handle this exception by itself
   */
  constructor(message) {
    super(message, 400);
  }
  // handle () {}
}

module.exports = BadRequestException
