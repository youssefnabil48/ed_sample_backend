'use strict';

const ValidationException = use('App/Exceptions/ValidationException');

class PromoCheck {
  get rules () {
    return {
      // validation rules
      code: 'required',
      course_id: 'required|number'
    };
  }

  get sanitizationRules () {
    this.ctx.request.body.code = this.ctx.request.body.code.toLowerCase();
    return {};
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = PromoCheck;
