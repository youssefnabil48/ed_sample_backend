"use strict";

const Env = use('Env');

module.exports = {

  email: {
    subject: {
      emailVerification: 'Confirm Your Email Address - EduAct Team',
      resetPassword: 'Reset Password Request - EduAct Team',
      supportEmail: 'Customer Support - EduAct'
    },
    body: {
      emailVerification: function (name, verificationToken) {

        return `<h1>Hi ${name},</h1>
               <h2>Welcome to EduAct!</h2>
               <p>You are now one step away from starting your online educational journey.</p>
               <p>Kindly verify your email by clicking on the button below</p>
               <div style=\"text-align: center;\">
               <a href=\"${Env.get('FRONTEND_URL')}/verify/${verificationToken}\" style=\"display: inline-block; min-width: 196px; text-align: center; border: none; padding: 15px 10px; font-weight: 600; font-size: 16px; position: relative; color: #fff; cursor: pointer; background: #5AC0FC; margin-top: 30px; border-radius: 15px;\">
                Verify Email
               </a>
               </div>
               <p>If the button doesn't work, please copy the following link in your browser:</p>
               <a href='${Env.get('FRONTEND_URL')}/verify/${verificationToken}'>
               ${Env.get('FRONTEND_URL')}/verify/${verificationToken}
               </a>
               <div style=\"margin-top: 50px;\">
               <a href="https://eduact.me">
               <img src='https://s3-eu-west-1.amazonaws.com/pictures.eduact.me/Artboard+11%404x.png' width="20%"/>
               </a>
               </div>`;


        // return `Please verify your email by clicking <a href="${Env.get('FRONTEND_URL')}/verify/${verificationToken}">here</a>.`;
      },
      resetPassword: function (name, token) {
        return `<h1>Hi ${name},</h1>
                <h2>Forgot Your password?</h2>
                <p>That's okay, you can simply reset your password by clicking on the button below</p>
                <div style=\"text-align: center;\">
                <a href=\"${Env.get('FRONTEND_URL')}/reset/${token}\" style=\"display: inline-block; min-width: 196px; text-align: center; border: none; padding: 15px 10px; font-weight: 600; font-size: 16px; position: relative; color: #fff; cursor: pointer; background: #5AC0FC; margin-top: 30px; border-radius: 15px;\">
                Reset Password
                </a>
                </div>
                <p>If the button doesn't work, please copy the following link in your browser:</p>
                <a href=\"${Env.get('FRONTEND_URL')}/reset/${token}\">
                ${Env.get('FRONTEND_URL')}/reset/${token}
                </a>
                <p>If you didn't mean to reset your password, then you can just ignore this email and your password won't change.</p>
                <div style=\"margin-top: 50px;\">
                <a href="https://eduact.me">
                <img src=\"https://s3-eu-west-1.amazonaws.com/pictures.eduact.me/Artboard+11%404x.png\" width="20%"/>
                </a>
                </div>`;

        // return `In order to reset your account password, please click <a href="${Env.get('FRONTEND_URL')}/reset/${token}">here</a>.`;
      },
      trustDevice: function (name, token) {
        return `<h1>Hi ${name},</h1>
                <p>A new untrusted device is trying to login to your EduAct account. To help keep your account secure, let
                us know if this is you by entering the following code:</p>
                <div style=\"text-align: center;\">
                <a style=\"display: inline-block; min-width: 196px; text-align: center; border: none; padding: 5px 10px; font-weight: 600; font-size: 24px; position: relative; color: #fff; cursor: pointer; background: #5ac0fc; margin-top: 30px; border-radius: 15px;\">
                ${token}
                </a>
                </div>
                <p>If this is not you, please contact our customer support team.</p>
                <div style=\"margin-top: 50px;\">
                <a href="https://eduact.me">
                <img src=\"https://s3-eu-west-1.amazonaws.com/pictures.eduact.me/Artboard+11%404x.png\" width="20%"/>
                </a>
                </div>`;

        // return `In order to trust the new device, please enter this code ${token}.`;
      },
      supportEmail: function (email, firstName, lastName, subject, body) {
        return `<h1>Customer Support Email</h1>
                <p><strong>From:</strong> ${firstName} ${lastName} (${email})</p>
                <p><strong>Subject</strong></p>
                <p>${subject}</p>
                <p><strong>Message</strong></p>
                <p>${body}</p>
                <div style="margin-top: 50px;"><a href="https://s3-eu-west-1.amazonaws.com/pictures.eduact.me/Artboard+11%404x.png" width="20%" /> </a></div>`;
      },
      NotificationEmail: function (firstName, body) {
        return `<h1>Hi ${firstName},</h1>
                <p>${body}</p>
                <p>If you have any questions, please contact our customer support team.</p>
                <div style=\"margin-top: 50px;\">
                <a href="https://eduact.me">
                <img src=\"https://s3-eu-west-1.amazonaws.com/pictures.eduact.me/Artboard+11%404x.png\" width="20%"/>
                </a>
                </div>`;
      },
      TalentDownEmail: function (engBody, arbBody) {
        return `<h1>Dear Students,</h1>
                <p>${engBody}</p>
                <p>-----------------------------------------------------------------</p>
                <p>${arbBody}</p>
                <p>If you have any questions, please contact our customer support team.</p>
                <div style=\"margin-top: 50px;\">
                <a href="https://eduact.me">
                <img src=\"https://s3-eu-west-1.amazonaws.com/pictures.eduact.me/logoEmail.png\" width="20%"/>
                </a>
                </div>`;
      }
    }
  },
  user: {
    general: {
      verificationToken: 'Device Verification Token',
      confirmEmail: 'Please Confirm Your Email',
      confirmPhone: 'Please Confirm Your Phone Number',
      phoneSMS: 'Your Phone Verification Code is: ',
      checkEmail: 'Please Check Your Email',
      checkPhone: 'Please Check Your Phone',
      completeProfile: 'Please Complete Your Profile'
    },
    success: {
      signup: 'Registration Successful',
      email: 'Email Verified Successfully',
      phone: 'Phone Number Verified Successfully',
      login: 'Login Successful',
      userProfile: 'User Profile',
      editProfile: 'Profile Updated Successfully',
      supportEmail: 'Your email was sent successfully, we will get back to you shortly'
    },
    error: {
      invalidAmount: 'Invalid Amount',
      incorrectCred: 'Email/Phone or Password Is Incorrect',
      emailUnique: 'Email already exists',
      phoneUnique: 'Phone number already exists',
      emailVerified: 'Email is already verified',
      notFound: 'User not found'
    }
  }
};
