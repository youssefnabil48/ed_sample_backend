'use strict';

const ValidationException = use('App/Exceptions/ValidationException');

class CartItems {
  get rules () {
    return {
      // validation rules
      course_ids: 'required|array'
    };
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = CartItems;
