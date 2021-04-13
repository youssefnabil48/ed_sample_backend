'use strict';

const ValidationException = use('App/Exceptions/ValidationException');

class TrustDevice {
  get rules () {
    return {
      // validation rules
      'device-uuid': 'required|regex:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
    };
  }

  get data () {
    const requestBody = this.ctx.request.all();
    const device_uuid = this.ctx.request.header('device-uuid');
    return Object.assign({}, requestBody, { 'device-uuid': device_uuid });
  }

  async fails(errorMessages){
    throw new ValidationException(errorMessages);
  }
}

module.exports = TrustDevice;
