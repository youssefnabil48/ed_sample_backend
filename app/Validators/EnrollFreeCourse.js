'use strict';

const ValidationException = use('App/Exceptions/ValidationException');

class EnrollFreeCourse {
  get rules () {
    return {
      // validation rules
      'course_id':'required|number'
    };
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = EnrollFreeCourse;
