'use strict'

const User = use('App/Models/User');
const Address = use('App/Models/Address');
const Student = use('App/Models/Student');
const Instructor = use('App/Models/Instructor');
const Verification = use('App/Models/Verification');
const ValidationException = use('App/Exceptions/ValidationException');
const TrustedDevice = use('App/Models/TrustedDevice');
const Helpers = use('App/Helpers/Helpers');
const ResourceNotFoundException = use('App/Exceptions/ResourceNotFoundException');
const CustomException = use('App/Exceptions/CustomException');
const Database = use('Database');
const Codes = use('App/Constants/Codes');
const Mail = use('App/Helpers/Mail');
const Messages = use('App/Constants/Messages');
const SMS = use('App/Helpers/SMS')
const Drive = use('Drive')
const Http = use('App/Helpers/Http')
const BlockedEmail = use('App/Models/BlockedEmail')

class UserService {

  async findByOrFail(field, value) {
    const user = await User.findBy(field, value)
    if (!user)
      throw new ResourceNotFoundException('User not found')
    return user
  }

  async update(id, data) {
    await User.query().where('id', id).update(data);
  }

  async getUserProfile(id) {
    let userProfile = await User.query().where('id', id).with('student.address').with('student.wallet').with('instructor').first();
    if (!userProfile)
      throw new ResourceNotFoundException('User Not Found');
    userProfile.type = await this.getUserType(id);
    return userProfile;
  }

  async getUserType(id) {
    let type = [];
    const user = (await User.query().where('id', id).with('student').with('instructor').first()).toJSON();
    if (user.student)
      type.push('student');
    if (user.instructor)
      type.push('instructor');
    return type;
  }

  async createUser(user) {
    user.uuid = Helpers.generateUUID()
    user.username = Helpers.generateUsername(user.first_name, user.last_name)
    return User.create(user);
  }

  //verifications
  async getVerificationById(userID) {
    return Verification.findBy('user_id', userID);
  }

  async getVerificationByToken(token, type) {
    return Verification.query().where('token', token).where('type', type).first();
  }

  async addVerificationToken(id, type) {
    return Verification.findOrCreate(
      {
        user_id: id,
        type: type
      },
      {
        user_id: id,
        token: await Helpers.generateToken(),
        type: type
      }
    );
  }

  async deleteVerificationToken(token) {
    await Verification.query().where('token', token).delete();
  }

  async sendEmailVerificationToken(user) {
    const verification = await this.addVerificationToken(user.id, 'email');
    try {
      await Mail.sendEmail(user.email, Messages.email.subject.emailVerification, Messages.email.body.emailVerification(user.first_name, verification.token));
    } catch (error) {
      console.log('email failed to be sent', error);
    }
  }

  async sendPhoneVerificationPin(user) {
    let verificationToken = await Helpers.generatePinCode();
    await this.addVerificationToken(user.id, 'phone', verificationToken);
    //send sms to mobile phone
    const response = await SMS.sendSMS([user.phone_number], Messages.user.general.phoneSMS + verificationToken)
    console.log('Sms response: ', response)
    return response
  }

  async sendResetPasswordToken(user) {
    let token = await Helpers.generateToken();
    await this.update(user.id, {password_reset_token: token});
    Mail.sendEmail(user.email, Messages.email.subject.resetPassword, Messages.email.body.resetPassword(user.first_name, token));
  }

  // async sendTrustDevicePin(user) {
  //   let token = await Helpers.generatePinCode();
  //   await this.addVerificationToken(user.id, token);
  //   Mail.sendEmail(user.email, Messages.user.general.verificationToken, Messages.email.body.trustDevice(user.first_name, token));
  // }

  // async isTrustedDevice(id, device_uuid = '') {
  // }

  // async addTrustedDevice(id, device_uuid) {
  //   return TrustedDevice.findOrCreate(
  //     {
  //       user_id: id,
  //       device_uuid: device_uuid
  //     },
  //     {
  //       user_id: id,
  //       device_uuid: device_uuid
  //     });
  // }
  //   return await TrustedDevice.query().where('user_id', id).where('device_uuid', device_uuid).first();


  sendSupportEmail(user, request) {
    Mail.sendEmail('info@eduact.me', Messages.email.subject.supportEmail, Messages.email.body.supportEmail(user.email, user.first_name, user.last_name, request.subject, request.body));
  }

  async isValidMailBox(email) {
    return await Mail.isValidEmail(email);
  }

  async isBlockedEmail(email) {
    const e = await BlockedEmail.findBy('email', email)
    if (e) {
      throw new CustomException('Email doesn\'t exist', Codes.Error.Http.badRequest)
    }
  }

  async saveLoginIp(user, request) {
    const student = await user.student().fetch();
    if (student)
      await student.ips().create({ip_address: request.ip()})
  }

  async uploadProfilePic(user, request) {
    let response;
    let now = Date.now();
    await request.multipart.file('photo', {}, async file => {
      try {
        await this.validateProfilePic(file);
        response = await Drive.disk('s3').put(
          `${user.first_name}${user.last_name}${user.id}${now}.${file.extname}`,
          file.stream, {
            ACL: 'public-read'
          }
        );
        await this.update(user.id, {
          profile_photo: response
        });
      } catch (error) {
        throw new ValidationException([{message: error}]);
      }
    });
    await request.multipart.process();
  }

  async validateProfilePic(file) {
    if (file.type !== 'image') {
      throw 'File must be of type image';
    }
    if (!['jpeg', 'jpg', 'png'].includes(file.subtype)) {
      throw 'File extension must be jpeg , jpg or png';
    }
    if (file.stream.byteCount > 2 * 1000000) {
      throw `${file.clientName}'s size exceeded limit`;
    }
  }

  async addStudentObjectToUser(user, student = null) {
    if (user.toJSON().student)
      return user
    if (!student)
      student = await user.student().first()
    user.student = student
    return user
  }


  async sendPhoneRedirectionResponse(responseObject, token, user, type) {
    return Http.sendAuthenticatedRedirectionResponse(responseObject,
      token,
      await this.addStudentObjectToUser(user),
      type,
      Codes.Error.Redirect.phoneVerification,
      Messages.user.general.confirmPhone
    )
  }

  async sendEmailRedirectionResponse(responseObject, token, user, type) {
    return Http.sendAuthenticatedRedirectionResponse(responseObject,
      token,
      await this.addStudentObjectToUser(user),
      type,
      Codes.Error.Redirect.emailVerification,
      Messages.user.general.confirmEmail
    )
  }

  async sendLoginProfileRedirectionResponse(responseObject, token, user, type) {
    return Http.sendAuthenticatedRedirectionResponse(responseObject,
      token,
      await this.addStudentObjectToUser(user),
      type,
      Codes.Error.Redirect.completeLoginProfile,
      Messages.user.general.completeProfile
    )
  }
}

module.exports = UserService;
