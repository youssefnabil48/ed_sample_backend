'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

class RedirectionException extends LogicalException {
  /**
   * Handle this exception by itself
   */
  // handle () {}
}

module.exports = RedirectionException
