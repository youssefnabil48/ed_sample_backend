'use strict';

const { LogicalException } = require('@adonisjs/generic-exceptions');

class ValidationException extends LogicalException {
  constructor(message) {
    super(message, 400);
  }
  /**
   * Handle this exception by itself
   * this method takes less priority then the global handler Handler.js handle function
   */
  // handle (error, { response }) {}

}

module.exports = ValidationException;
