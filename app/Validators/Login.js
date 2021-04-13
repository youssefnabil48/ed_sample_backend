'use strict';

const ValidationException = use('App/Exceptions/ValidationException');

class Login {

  get rules () {
    return {
      // validation rules
      identifier: 'required',
      password: 'required|min:8|max:20'
    };
  }

  get sanitizationRules () {
    if (this.ctx.request.body.identifier) {
      this.ctx.request.body.identifier = this.ctx.request.body.identifier.toLowerCase();
      return {
        'identifier': 'trim',
      };
    }
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = Login;
