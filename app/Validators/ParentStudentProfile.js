'use strict'

const ValidationException = use('App/Exceptions/ValidationException');

class ParentStudentProfile {
  get rules () {
    return {
      parentPhone: 'required',
      username: 'required'
    }
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = ParentStudentProfile
