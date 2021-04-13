'use strict';

const axios = require('axios').default;
const Qs = use('qs');


class Http {

  static createResponseBody(ok, data, message) {
    this.responseBody = {
      ok: ok,
      data: data,
      message: message,
    };
  }

  static sendResponse(responseObject, ok, data, message, responseStatus = 200) {
    this.createResponseBody(ok, data, message);
    return responseObject.status(responseStatus).send(this.responseBody);
  }

  static sendAuthenticatedRedirectionResponse(responseObject, token, user, type, redirectionCode, message) {
    return this.sendResponse(responseObject, false, {
      token: token,
      user: user,
      type: type,
      redirect: redirectionCode,
    }, message)
  }

  static sendForbiddenRedirectionResponse(responseObject, redirectionCode, message) {
    return this.sendResponse(responseObject, false, {
      redirect: redirectionCode,
    }, message, 403)
  }

  static post(url, body, params = {}, headers = {}) {
    return axios({
      url: url,
      method: 'post',
      headers: headers,
      data: body,
      params: params,
      paramsSerializer: function (params) {
        return Qs.stringify(params, {encode: false});
      },
    });
  }

  static get(url, params = {}, headers = {}) {
    return axios({
      url: url,
      method: 'get',
      headers: headers,
      params: params,
      paramsSerializer: function (params) {
        return Qs.stringify(params, {encode: false});
      },
    });
  }

  static put(url, body, params = {}, headers = {}) {
    return axios({
      url: url,
      method: 'put',
      headers: headers,
      data: body,
      params: params,
      paramsSerializer: function (params) {
        return Qs.stringify(params, {encode: false});
      },
    });
  }

  static delete(url, body, params = {}, headers = {}) {
    return axios({
      url: url,
      method: 'delete',
      headers: headers,
      data: body,
      params: params,
      paramsSerializer: function (params) {
        return Qs.stringify(params, {encode: false});
      },
    });
  }

}

module.exports = Http;
