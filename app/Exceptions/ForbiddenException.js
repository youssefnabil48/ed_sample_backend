'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

class ForbiddenException extends LogicalException {

  constructor(message) {
    super(message, 403);
  }
  /**
   * Handle this exception by itself
   */
  // handle () {}
}

module.exports = ForbiddenException
