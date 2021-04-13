'use strict';

const { LogicalException } = require('@adonisjs/generic-exceptions');

class ConflictException extends LogicalException {
  constructor(message) {
    super(message, 409);
  }
  /**
   * Handle this exception by itself
   */
  // handle () {}
}

module.exports = ConflictException
