'use strict';
const crypto = use('crypto');
// import crypto from 'crypto';
const securePin = use('secure-pin');
const uuidv4 = use('uuid/v4');
const date = use('date-and-time');
const sha256 = use('crypto-js/sha256');
const Env = use('Env');
const Rates = use('App/Constants/Rates')
const Invoice = use('App/Models/Invoice')

class Helpers {

  static async generateToken(length = 64) {
    let token, invoice;
    do {
      token = await crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, length); // return required number of characters
      invoice = await Invoice.query().where('invoice_ref', 'r-'+token).orWhere('invoice_ref', 'w-'+token).first()
    } while(invoice)
    return token
  }

  static generateMixedCaseToken (howMany, chars) {
    chars = chars || 'abcdefghjkmnpqrstuwxyzABCDEFGHJKMNPQRSTUWXYZ123456789';
    let rnd = crypto.randomBytes(howMany)
      , value = new Array(howMany)
      , len = Math.min(256, chars.length)
      , d = 256 / len

    for (let i = 0; i < howMany; i++) {
      value[i] = chars[Math.floor(rnd[i] / d)]
    }

    return value.join('');
  }

  static generatePinCode(length = 6) {
    return securePin.generatePinSync(length);
  }

  static generateUsername(fname, lname) {
    return fname[0].toLowerCase() + lname[0].toLowerCase() + this.generatePinCode()
  }

  static generateUUID() {
    let uuid = uuidv4();
    uuid = uuid.replace(/-/g, '');
    return uuid;
  }

  static now(format='YYYY/MM/DD HH:mm:ss') {
    const now = new Date();
    return date.format(now, format);
  }

  static expiryTime(hours) {
    const now = new Date();
    const expiryDate = date.addHours(now, hours);
    return date.format(expiryDate, 'YYYY/MM/DD HH:mm:ss');
  }

  static upperCaseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  static lowerCaseAllWordsExceptFirstLetters(string) {
    return string.replace(/\S*/g, function (word) {
      return word.charAt(0) + word.slice(1).toLowerCase();
    });
  }

  static capitalizeWord(word) {
    return this.upperCaseFirstLetter(this.lowerCaseAllWordsExceptFirstLetters(word))
  };
}

module.exports = Helpers;
