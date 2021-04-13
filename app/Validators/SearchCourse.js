'use strict';
const ValidationException = use('App/Exceptions/ValidationException');

class SearchCourse {
  get rules () {
    return {
      // validation rules
      name: 'alpha',
      category: 'alpha'
    };
  }

  get sanitizationRules () {
    return {
      name:'trim|strip_tags|escape',
      category: 'trim|strip_tags|escape'
    };
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = SearchCourse;
