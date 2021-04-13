'use strict'

const Task = use('Task')
const Sync = use('App/Services/Sync/SyncService')

class SyncLMS extends Task {
  static get schedule () {
    return '0 3 * * *'
  }

  async handle () {
    console.log('Task SyncLMS handle')
    const syncService = new Sync()
    const courses = await syncService.getLmsCourses()
    console.log('-----getting lms courses-------')
    await syncService.updateCourses(courses)
    console.log('-----updating courses----')
    await syncService.updateCurrentActiveCourse()
    console.log('Task SyncLMS finished')
  }
}

module.exports = SyncLMS
