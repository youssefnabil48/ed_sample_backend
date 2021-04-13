'use strict';

const { LogicalException } = require('@adonisjs/generic-exceptions');

class UnauthorizedException extends LogicalException {
  constructor(message) {
    super(message, 401);
  }
  /**
   * Handle this exception by itself
   */
  // handle () {}
}

module.exports = UnauthorizedException;
