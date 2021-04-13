'use strict'

const TalentLMS = use('App/Lib/LMS/TalentLms/index')
const {ServiceProvider} = require('@adonisjs/fold')

class TalentLMSServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('TalentLms', () => {
      return new TalentLMS(this.app.use('Env'))
    })
  }
}

module.exports = TalentLMSServiceProvider
