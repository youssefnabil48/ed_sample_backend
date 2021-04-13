'use strict'

const SyncService = use('App/Services/Sync/SyncService')

const Sync = exports = module.exports = {}

Sync.sync = async () => {
  console.log('sync listener')
  console.log('Task SyncLMS handle')
  const syncService = new SyncService()
  const courses = await syncService.getLmsCourses()
  console.log('-----getting lms courses-------')
  await syncService.updateCourses(courses)
  console.log('-----updating courses----')
  await syncService.updateCurrentActiveCourse()
  console.log('Task SyncLMS finished')
}
