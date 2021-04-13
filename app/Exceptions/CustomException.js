'use strict';

const { LogicalException } = require('@adonisjs/generic-exceptions');

class CustomException extends LogicalException {
  // constructor() {
  //   super();
  // }
  /**
   * Handle this exception by itself
   * this method takes less priority then the global handler Handler.js handle function
   */
  // handle () {}
}

module.exports = CustomException;
