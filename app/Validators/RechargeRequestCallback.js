'use strict'

const ValidationException = use('App/Exceptions/ValidationException');

class RechargeRequestCallback {
  get rules () {
    return {
      provider: 'required|in:fawry'
    }
  }

  get sanitizationRules () {
    return {};
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
  
}

module.exports = RechargeRequestCallback
