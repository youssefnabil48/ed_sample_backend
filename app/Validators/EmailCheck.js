'use strict';
const ValidationException = use('App/Exceptions/ValidationException');

class EmailCheck {
  get rules() {
    return {
      'email': 'required|email',
    };
  }


  get messages() {
    return {
      'email.email': 'Email must be a valid email format (User@example.com)',
    };
  }

  get sanitizationRules() {
    return {
      'email': 'trim',
    };
  }

  get data() {
    if(this.ctx.request.body.email)
      this.ctx.request.body.email = this.ctx.request.body.email.toLowerCase();
  }

  async fails(errorMessages) {
    throw new ValidationException(errorMessages);
  }
}

module.exports = EmailCheck;
