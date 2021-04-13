'use strict';
const ValidationException = use('App/Exceptions/ValidationException');

class CompleteBuyProfile {
  get rules() {
    return {
      'parent1_name': 'required|alpha|min:2|in:Father,Mother,Brother,Sister,Other',
      'parent2_name': 'required|alpha|min:2|in:Father,Mother,Brother,Sister,Other',
      'parent1_phone': 'required|min:11|max:11|number',
      'parent2_phone': 'required|min:11|max:11|number',
      // 'ssn': 'required|min:10'
    };
  }

  get sanitizationRules() {
    return {
      'parent1_phone': 'trim',
      'parent2_phone': 'trim',
      'parent1_name': 'escape|trim',
      'parent2_name': 'escape|trim',
      'snn': 'escape|trim'
    };
  }

  get messages() {
    return {
      'parent1_name.alpha': 'Parent name must be letters from A-Z',
      'parent2_name.alpha': 'Parent name must be letters from A-Z',
      'parent1_phone.number': 'Phone Number must contain only numbers from 0-9',
      'parent2_phone.number': 'Phone Number must contain only numbers from 0-9',
    };
  }

  async fails(errorMessages) {
    throw new ValidationException(errorMessages);
  }

}

module.exports = CompleteBuyProfile;
