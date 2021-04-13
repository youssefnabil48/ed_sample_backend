'use strict'

const ValidationException = use('App/Exceptions/ValidationException');

class StudentProgressInCourse {
  get rules () {
    return {
      course_id: 'required',
      username: 'required'
    }
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = StudentProgressInCourse
