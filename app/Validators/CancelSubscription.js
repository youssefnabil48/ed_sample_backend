'use strict'

const ValidationException = use("App/Exceptions/ValidationException");

class CancelSubscription {
  get rules () {
    return {
      'classroom_id': 'required'
    }
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = CancelSubscription
