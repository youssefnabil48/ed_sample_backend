'use strict';
const ValidationException = use('App/Exceptions/ValidationException');

class ForgetPassword {
  get rules() {
    return {
      // validation rules
      identifier: 'required'
    };
  }

  get sanitizationRules() {
    if (this.ctx.request.body.identifier) {
      this.ctx.request.body.identifier = this.ctx.request.body.identifier.toLowerCase();
      return {
        'identifier': 'trim',
      };
    }
  }

  async fails(errorMessages) {
    throw new ValidationException(errorMessages);
  }
}

module.exports = ForgetPassword;
