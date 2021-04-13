'use strict'

const ValidationException = use("App/Exceptions/ValidationException");

class Subscription {
  get rules () {
    return {
      // validation rules
      'plan': 'required|in:week,month',
      'classroom_id': 'required'
    }
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = Subscription
