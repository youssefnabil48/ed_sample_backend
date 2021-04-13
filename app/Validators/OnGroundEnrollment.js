'use strict'

const ValidationException = use('App/Exceptions/ValidationException');

class OnGroundEnrollment {
  get rules () {
    return {
      course_id: 'required',
      code: 'required'
    }
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = OnGroundEnrollment
