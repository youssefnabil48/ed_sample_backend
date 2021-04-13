"use strict";

const nodemailer = use("nodemailer");
const aws = use("aws-sdk");
const Env = use("Env");
const EmailValidator = require("email-deep-validator");
const CustomException = use("App/Exceptions/CustomException");
const Http = use('App/Helpers/Http')
const BlockedEmail = use('App/Models/BlockedEmail')
const Codes = use('App/Constants/Codes');

class Mail {
  static async sendEmail(email, subject, content) {
    aws.config.update({
      accessKeyId: Env.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: Env.get('AWS_SECRET_ACCESS_KEY'),
      region: Env.get('AWS_REGION')
    });

    // Create sendEmail params
    var params = {
      Destination: {
        /* required */
        ToAddresses: [
          email,
          // email
          /* more items */
        ]
      },
      Message: {
        /* required */
        Body: {
          /* required */
          Html: {
            Charset: "UTF-8",
            Data: content
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        }
      },
      Source: 'no-reply@eduact.me',
      /* required */
      ReplyToAddresses: [
        'no-reply@eduact.me',
        /* more items */
      ],
    };

    // Create the promise and SES service object
    var sendPromise = new aws.SES({
      apiVersion: '2010-12-01'
    }).sendEmail(params).promise();

    // return sendPromise;

    // Handle promise's fulfilled/rejected states
    sendPromise.then(
      function (data) {
        console.log('Mailer: ',data);
        return data;
      }).catch(
      function (err) {
        console.log('Mailer: ',err);
        return err;
      });
  }

  static async isValidEmail(email){
    let res = null;
    try{
      res = await Http.get('https://api.debounce.io/v1/', {api: Env.get('DEBOUNCE_API_KEY'), email: email})
    }catch (e){
      throw new CustomException('Service Unavailable')
    }
    if(Number(res.data.balance) < 1000){
      await this.sendEmail('marwanamrhuss@gmail.com', 'Debounce email validation Quota warning', 'Quota < 1000')
    }
    if(Number(res.data.debounce.code) !== 5){
      await BlockedEmail.create({
        email: email
      })
      throw new CustomException('This email doesn\'t even exist!', Codes.Error.Http.badRequest)
    }
  }
}

module.exports = Mail;
