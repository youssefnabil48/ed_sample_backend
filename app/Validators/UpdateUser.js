'use strict';
const ValidationException = use('App/Exceptions/ValidationException');

class UpdateUser {
  get rules () {
    return {
      // validation rules
      'phone_number': 'min:11|max:11|number',
      'first_name': 'alpha',
      'middle_name': 'alpha|min:2',
      'last_name': 'alpha',
      'gender': 'in:male,female',
      'birth_date': 'date',
      'student.parent1_name': 'alpha|min:2',
      'student.parent2_name': 'alpha|min:2',
      'student.parent1_phone': 'min:11|max:11|number',
      'student.parent2_phone': 'min:11|max:11|number',
      'address.building_number': 'required_if:address.floor',
      'address.floor': 'required_if:address.apartment',
      'address.apartment': 'required_if:address.street',
      'address.street': 'required_if:address.governorate',
      'address.governorate': 'required_if:address.city',
      'address.city': 'required_if:address.country',
      'address.country': 'required_if:address.postal_code|in:Egypt',
      'address.postal_code': 'required_if:address.building_number',
    };
  }

  get sanitizationRules(){
    return {
      'phone_number': 'trim',
      'student.parent1_phone': 'trim',
      'student.parent2_phone': 'trim',
      'first_name': 'escape|trim',
      'middle_name': 'escape|trim',
      'last_name': 'escape|trim',
      'student.parent1_name': 'escape|trim',
      'student.parent2_name': 'escape|trim',
      'address.building_number': 'escape|trim',
      'address.floor': 'escape|trim',
      'address.apartment': 'escape|trim',
      'address.street': 'escape|trim',
      'address.governorate': 'escape|trim',
      'address.city': 'escape|trim',
      'address.country': 'escape|trim',
      'address.postal_code': 'escape|trim',
    };
  }

  get messages () {
    return {
      'first_name.alpha': 'First name must be letters from A-Z',
      'last_name.alpha': 'Last name must be letters from A-Z',
      'middle_name.alpha': 'Middle name must be letters from A-Z',
      'student.parent1_name.alpha': 'Parent name must be letters from A-Z',
      'student.parent2_name.alpha': 'Parent name must be letters from A-Z',
    };
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }

}

module.exports = UpdateUser;
