'use strict';

const ValidationException = use('App/Exceptions/ValidationException');

class AddReview {
  get rules () {
    return {
      // validation rules
      'review.rating':'required|range:0.9,5.1|number',
      'review.comment':'required|accepted'
    };
  }

  get sanitizationRules () {
    return {
      'review.rating':'trim|strip_tags|escape',
      'review.comment':'trim|strip_tags|escape'
    };
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = AddReview;
