'use strict'

const ValidationException = use('App/Exceptions/ValidationException');

class RechargeRequest {
  get rules () {
    return {
      method: 'required|in:fawry,card,kiosk,aman,masary,ewallet',
      amount: 'required|number'
    }
  }

  get sanitizationRules () {
    return {};
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }

  get data () {
    return this.ctx.request.get()
  }
}

module.exports = RechargeRequest
