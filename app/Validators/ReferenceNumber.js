'use strict'

const ValidationException = use('App/Exceptions/ValidationException');

class ReferenceNumber {
  get rules () {
    return {
      reference_number: 'required'
    }
  }

  get sanitizationRules () {
    return {};
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = ReferenceNumber
