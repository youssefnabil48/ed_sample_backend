'use strict'

const ValidationException = use("App/Exceptions/ValidationException");

class Checkout {
  get rules () {
    return {
      'payment_method': 'required|in:wallet,cash'
    }
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = Checkout
