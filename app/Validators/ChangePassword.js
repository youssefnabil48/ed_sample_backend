'use strict';

const ValidationException = use('App/Exceptions/ValidationException');

class ChangePassword {
  get rules () {
    return {
      // validation rules
      'old_password': 'required|min:8|max:20',
      'new_password': 'required|min:8|max:20',
      'confirm_new_password': 'required|same:new_password'
    };
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = ChangePassword;
