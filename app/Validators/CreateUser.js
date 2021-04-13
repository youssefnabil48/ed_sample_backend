'use strict';
const ValidationException = use('App/Exceptions/ValidationException');
class CreateUser {
  get rules () {
    return {
      'email': 'required|email',
      'password': 'required|min:8|max:20',
      'phone_number': 'required|min:11|max:11|number',
      'first_name': 'required|alpha',
      'middle_name': 'alpha|min:2',
      'last_name': 'required|alpha',
      'gender': 'in:male,female',
      'birth_date': 'date',
      // 'device-uuid': 'required|regex:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
    };
  }


  get messages () {
    return {
      'first_name.alpha': 'First name must be letters from A-Z',
      'last_name.alpha': 'Last name must be letters from A-Z',
      'email.email': 'Email must be a valid email format (User@example.com)',
      'phone_number.number': 'Phone Number must contain only numbers from 0-9'
    };
  }

  get sanitizationRules(){
    return {
      'email': 'trim',
      'first_name': 'escape|trim',
      'last_name': 'escape|trim',
    };
  }

  get data () {
    this.ctx.request.body.email = this.ctx.request.body.email.toLowerCase();
    // const device_uuid = this.ctx.request.header('device-uuid');
    // return Object.assign({}, requestBody, { 'device-uuid': device_uuid });
    // return this.ctx.request.body
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = CreateUser;
