'use strict';
const ValidationException = use('App/Exceptions/ValidationException');

class SupportEmail {
  get rules () {
    return {
      // validation rules
      subject: 'required',
      body: 'required'
    };
  }

  get sanitizationRules () {
    return {
      subject:'trim|strip_tags|escape',
      body: 'trim|strip_tags|escape'
    };
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = SupportEmail;
