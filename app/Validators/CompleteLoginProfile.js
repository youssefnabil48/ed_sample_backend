'use strict';
const ValidationException = use('App/Exceptions/ValidationException');

class CompleteLoginProfile {
  get rules() {
    return {
      // validation rules
      'gender': 'required|in:male,female',
      'birth_date': 'required|date',
      'student.edu_type': 'required|in:National English,National Arabic,IGCSE,American,IB,Francais',
      'student.edu_field': 'required|in:Science,Mathematics,Literature,NA',
      'student.edu_year': 'required|in:First Secondary,Second Secondary,Third Secondary,Grade 10,Grade 11,Grade 12',
      'student.school': 'required'
    };
  }

  get sanitizationRules() {
    return {
      'gender': 'escape|trim',
      'birth_date': 'escape|trim',
      'student.edu_type': 'escape|trim',
      'student.edu_field': 'escape|trim',
      'student.edu_year': 'escape|trim',
      'student.school': 'escape|trim'
    };
  }

  async fails(errorMessages) {
    throw new ValidationException(errorMessages);
  }

}

module.exports = CompleteLoginProfile;
