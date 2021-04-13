'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Http = use('App/Helpers/Http');
const Hash = use('Hash');
const Messages = use('App/Constants/Messages');
const UserService = use('App/Services/User/UserService');
const Helpers = use('App/Helpers/Helpers');
const CustomException = use('App/Exceptions/CustomException');
const Codes = use('App/Constants/Codes');
const UnauthorizedException = use('App/Exceptions/UnauthorizedException');
const ValidationException = use('App/Exceptions/ValidationException');
const ForbiddenException = use('App/Exceptions/ForbiddenException');
const ConflictException = use('App/Exceptions/ConflictException');
const ResourceNotFoundException = use('App/Exceptions/ResourceNotFoundException');
const StudentService = use('App/Services/User/StudentService.js')
const validator = use('validator')

class UserController {

  constructor() {
    this.userService = new UserService()
    this.studentService = new StudentService()
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async signup({request, response}) {
    //validating email address
    await this.userService.isBlockedEmail(request.body.email)
    await this.userService.isValidMailBox(request.body.email)
    try {
      const user = await this.studentService.create(request.body)
      await this.userService.sendEmailVerificationToken(user);
      // await this.userService.sendPhoneVerificationPin(user)
      // await userService.addTrustedDevice(user.id, request.header('device-uuid'));
      return Http.sendResponse(response, false, {
        user: user,
        redirect: Codes.Error.Redirect.emailVerification
      }, Messages.user.success.signup);
    } catch (error) {
      if (Number(error.code) === Number(Codes.Error.Database.uniqueViolation)) {
        switch (error.constraint) {
          case 'users_phone_number_unique':
            throw new ConflictException(Messages.user.error.phoneUnique)
          case 'users_email_unique':
            throw new ConflictException(Messages.user.error.emailUnique)
        }
      }
      throw error;
    }
  }


  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Auth} ctx.auth
   */
  async login({request, response, auth}) {
    //getting user object
    let user, authObj, isTrustedDevice, authenticator = 'jwt', identifier = 'email';
    try {
      if (validator.isEmail(request.body.identifier)) {
        identifier = 'email'
        authenticator = 'jwt'
      } else if (validator.isMobilePhone(request.body.identifier, 'ar-EG')) {
        identifier = 'phone_number'
        authenticator = 'jwtPhone'
      }
      user = await this.userService.findByOrFail(identifier, request.body.identifier)
      authObj = await auth.authenticator(authenticator).attempt(request.body.identifier, request.body.password, {type: (await this.userService.getUserType(user.id))});
    } catch (error) {
      throw new CustomException(Messages.user.error.incorrectCred, 400);
    }
    await this.userService.saveLoginIp(user, request)
    const userProfile = await this.userService.getUserProfile(user.id);
    //Check phone verification
    // if (!user.phone_verified) {
    //   await this.userService.sendPhoneVerificationPin(user);
    //   return this.userService.sendPhoneRedirectionResponse(response, authObj.token, userProfile, userProfile.type)
    // }
    //Check email verification
    if (!user.email_verified) {
      await this.userService.sendEmailVerificationToken(user);
      return this.userService.sendEmailRedirectionResponse(response, authObj.token, userProfile, userProfile.type)
    }
    const student = await user.student().first()
    if (student && !student.profile_login) {
      return this.userService.sendLoginProfileRedirectionResponse(response, authObj.token, userProfile, userProfile.type)
    }
    //check if device is trusted
    // isTrustedDevice = await this.userService.isTrustedDevice(user.id, request.header('device-uuid'));
    // if (!isTrustedDevice) {
    //   await this.userService.sendTrustDevicePin(user);
    // }
    //sending response
    return Http.sendResponse(response, true, {
      token: authObj.token,
      user: userProfile,
      type: userProfile.type
    }, Messages.user.success.login);
  }


  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async confirmEmailAddress({request, response, auth}) {
    //getting saved verification token
    let tokenObj = await this.userService.getVerificationByToken(request.body.token, 'email');
    //checking if the 2 token matched
    if (!tokenObj)
      throw new CustomException('Invalid token', Codes.Error.Http.badRequest);
    //updating the user to be verified
    await this.userService.update(tokenObj.user_id, {email_verified: true});
    //deleting verification tokens
    await this.userService.deleteVerificationToken(request.body.token);
    const user = await this.userService.findByOrFail('id', tokenObj.user_id);
    //check if phone number is also verified to log user in
    // if (!user.phone_verified) {
    //   return this.userService.sendPhoneRedirectionResponse(response, token, user, userType)
    // }
    const userType = await this.userService.getUserType(tokenObj.user_id);
    const token = (await auth.generate(user, {type: userType})).token;
    //check if profile is also completed to log user in
    const student = await user.student().first()
    if (!student.profile_login) {
      return this.userService.sendLoginProfileRedirectionResponse(response, token, user, userType)
    }
    return Http.sendResponse(response, true, {
      token: token,
      type: userType,
      // trustedDevice: true,
      user: await this.userService.addStudentObjectToUser(user, student)
    }, Messages.user.success.login);
  }


  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async forgetPassword({request, response, view}) {
    //getting user
    try {
      let user = null;
      if (validator.isEmail(request.body.identifier)) {
        user = await this.userService.findByOrFail('email', request.body.identifier);
        if (!user.email_verified)
          return Http.sendResponse(response, false, null, 'Email is not verified, Please verify and try again', Codes.Error.Http.forbidden);
      } else if (validator.isMobilePhone(request.body.identifier, 'ar-EG')) {
        user = await this.userService.findByOrFail('phone_number', request.body.identifier);
        if (!user.phone_verified)
          return Http.sendResponse(response, false, null, 'Phone Number is not verified, Please verify and try again', Codes.Error.Http.forbidden);
      }
      //creating and sending a reset password token to the user
      await this.userService.sendResetPasswordToken(user);
      // returning response
      return Http.sendResponse(response, true, null, Messages.user.general.checkEmail);
    } catch (error) {
      throw new ResourceNotFoundException(Messages.user.error.notFound);
    }
  }


  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async resetPassword({request, response, view}) {
    //get the stored reset password token along side with the whole user object
    let user = await this.userService.findByOrFail('password_reset_token', request.body.token);
    //check if the two tokens match
    if (request.body.token !== user.password_reset_token)
      throw new CustomException('Invalid token', Codes.Error.Http.badRequest);
    //updating new password and destroying the token
    await this.userService.update(user.id, {
      password: (await Hash.make(request.body.password)),
      password_reset_token: null
    });
    //sending response to the user
    return Http.sendResponse(response, true, null, 'Password changed successfully');
  }


  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async confirmPhoneNumber({request, response, auth}) {
    //getting saved verification token
    let tokenObj = await this.userService.getVerificationByToken(request.body.token, 'phone');
    //checking if the 2 token matched
    if (!tokenObj)
      throw new CustomException('Invalid token', Codes.Error.Http.badRequest);
    //updating the user to be verified
    await this.userService.update(tokenObj.user_id, {phone_verified: true});
    //deleting verification tokens
    await this.userService.deleteVerificationToken(request.body.token);
    const user = await this.userService.findByOrFail('id', tokenObj.user_id);
    const userType = await this.userService.getUserType(tokenObj.user_id);
    const token = (await auth.generate(user, {type: userType})).token;
    //check if phone number is also verified to log user in
    if (!user.email_verified) {
      return this.userService.sendEmailRedirectionResponse(response, token, user, userType)
    }
    //check if profile is also completed to log user in
    const student = await user.student().first()
    if (!student.profile_login) {
      return this.userService.sendLoginProfileRedirectionResponse(response, token, user, userType)
    }
    return Http.sendResponse(response, true, {
      token: token,
      type: userType,
      // trustedDevice: true,
      user: await this.userService.addStudentObjectToUser(user)
    }, Messages.user.success.login);
  }


  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async resendEmailVerification({request, response, auth}) {
    let user = await this.userService.findByOrFail('email', request.body.email);
    if (user.email_verified)
      throw new ConflictException(Messages.user.error.emailVerified)
    await this.userService.sendEmailVerificationToken(user);
    return Http.sendResponse(response, true, null, Messages.user.general.confirmEmail);
  }


}

module.exports = UserController
