'use strict';
const ValidationException = use('App/Exceptions/ValidationException');
class VerifyToken {
  get rules () {
    return {
      // validation rules
      token: 'required'
    };
  }

  get sanitizationRules () {
    return {
    };
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = VerifyToken;
