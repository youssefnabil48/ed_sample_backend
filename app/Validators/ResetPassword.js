'use strict';
const ValidationException = use('App/Exceptions/ValidationException');
class ResetPassword {
  get rules () {
    return {
      // validation rules
      token: 'required',
      password: 'required|min:8'
    };
  }

  get sanitizationRules () {
    return {};
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = ResetPassword;
