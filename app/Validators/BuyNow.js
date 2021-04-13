'use strict'

const ValidationException = use("App/Exceptions/ValidationException");

class BuyNow {
  get rules () {
    return {
      'course_id': 'required',
      'payment_method': 'required|in:wallet'
    }
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = BuyNow
