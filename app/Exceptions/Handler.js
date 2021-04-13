'use strict';

const BaseExceptionHandler = use('BaseExceptionHandler');
const Http = use('App/Helpers/Http');
const Codes = use('App/Constants/Codes');
const Mail = use('App/Helpers/Mail')


/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  async handle(error, {request, response}) {
    //response.status(error.status).send(error.message)
    switch (error.name) {
      case'ValidationException':
        return Http.sendResponse(response, false, null, error.message[0].message, Codes.Error.Http.badRequest);
      case'UnauthorizedException':
        return Http.sendResponse(response, false, null, error.message, Codes.Error.Http.unauthorized);
      case'ResourceNotFoundException':
        return Http.sendResponse(response, false, null, error.message, Codes.Error.Http.notFound);
      case'ConflictException':
        return Http.sendResponse(response, false, null, error.message, Codes.Error.Http.conflict);
      case'ForbiddenException':
        return Http.sendResponse(response, false, null, error.message, Codes.Error.Http.forbidden);
      case'CustomException':
        return Http.sendResponse(response, false, null, error.message, error.status);
      case'RedirectionException':
        return Http.sendResponse(response, false, {redirect: error.code}, error.message, error.status || 200)
      case'BadRequestException':
        return Http.sendResponse(response, false, null, error.message, Codes.Error.Http.badRequest);
      default:
        if (error.status === 500 && process.env.NODE_ENV === 'production') {
          await Mail.sendEmail('marwanamrhuss@gmail.com', 'ERROR 500, Please Check!!', error.stack)
          await Mail.sendEmail('youssef.nabil.mustafa@gmail.com', 'ERROR 500, Please Check!!', error.stack)
        }
        return Http.sendResponse(response,
          false,
          null,
          error.status === 500 ? 'Oops!! Something went wrong.' : error.message,
          error.status || Codes.Error.Http.internalServerError);
    }
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param  {Object} options.request
   *
   * @return {void}
   */
  async report(error, {request}) {
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
      if(error.status === 500){
        console.log(error)
        console.log(request)
      }
      return
    }
    console.log(error)
  }
}

module.exports = ExceptionHandler;
