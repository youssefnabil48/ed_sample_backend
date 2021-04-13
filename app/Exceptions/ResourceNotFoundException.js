'use strict';

const { LogicalException } = require('@adonisjs/generic-exceptions');

class ResourceNotFoundException extends LogicalException {
  constructor(message) {
    super(message, 404);
  }
  /**
   * Handle this exception by itself
   */
  // handle () {}
}

module.exports = ResourceNotFoundException;
