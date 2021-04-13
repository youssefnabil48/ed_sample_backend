'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return {greeting: 'Hello world in JSON'}
})

//Auth Routes:
//--------------
Route.group(() => {
  Route.post('/signup', 'UserController.signup').validator('CreateUser');
  Route.post('/login', 'UserController.login').validator('Login');
  Route.post('/email/confirm', 'UserController.confirmEmailAddress').validator('VerifyToken');
  Route.post('/password/forget', 'UserController.forgetPassword').validator('ForgetPassword');
  Route.post('/password/reset', 'UserController.resetPassword').validator('ResetPassword');
  Route.post('/phone/confirm', 'UserController.confirmPhoneNumber').validator('VerifyToken');
  Route.post('/email/verification/resend', 'UserController.resendEmailVerification').validator('EmailCheck');
  Route.post('/password/verification/resend', 'UserController.forgetPassword').validator('ForgetPassword');
}).prefix('/api/auth');

//Student Profile Routes:
//------------------------
Route.group(() => {
  Route.get('/', 'StudentController.getStudentProfile');
  Route.put('/', 'StudentController.updateStudentProfile').middleware(['filterUserObject']).validator('UpdateUser');
  Route.put('/login/complete', 'StudentController.completeStudentLoginProfile').middleware(['filterUserObject']).validator('CompleteLoginProfile');
  Route.put('/buy/complete', 'StudentController.completeStudentBuyProfile').validator('CompleteBuyProfile');
  Route.put('/password/change', 'StudentController.changePassword').validator('ChangePassword');
  Route.post('/picture/upload', 'StudentController.uploadProfilePic');
  Route.get('/course', 'StudentController.getUserCourses');
  //Sending Support Email
  Route.post('/email/support', 'StudentController.sendSupportEmail').validator('SupportEmail');//.middleware(['throttle:5']);
  Route.post('/invoices', 'StudentController.getAllInvoices')
  Route.get('/classrooms', 'StudentController.getSubscribedClassrooms')
  Route.get('/courses', 'StudentController.getPurchasedCourses')
  //Wallet History
  Route.post('/wallet/history', 'StudentController.getWalletHistory')
  Route.post('/timeline', 'StudentController.getTimeline')
}).prefix('/api/student/profile').middleware(['auth:jwt']);

Route.group(() => {
  Route.post('/progress/check', 'StudentController.parentStudentProfileCheck').validator('ParentStudentProfile')
  Route.post('/progress', 'StudentController.parentStudentProfile').validator('ParentStudentProfile')
  Route.post('/course/progress', 'StudentController.ProgressInCourse').validator('StudentProgressInCourse')
}).prefix('/api/student')

//Instructor Routes
//------------------------
Route.group(() => {
  Route.get('/student/progress/:student_username/:course_id', 'InstructorController.getStudentProgressInCourse')
  Route.get('/student/profile/:student_username', 'InstructorController.getStudentLmsProfile')
}).prefix('/api/instructor').middleware(['auth:jwt', 'isInstructor'])

Route.group(() => {
  Route.get('/all', 'InstructorController.getAll')
  Route.get('', 'InstructorController.get')
}).prefix('/api/instructor')

//Classroom Routes:
//------------------------
Route.group(() => {
  Route.get('/all', 'ClassroomController.getAll');
  Route.get('/search', 'ClassroomController.search').validator('SearchCourse');
  Route.get('/get/:label', 'ClassroomController.getClassroom');
}).prefix('/api/classroom');

Route.group(() => {
  Route.post('/enroll/code', 'ClassroomController.enrollOnGroundCourse').validator('OnGroundEnrollment')
  Route.post('/subscribe', 'ClassroomController.subscribe').middleware(['isSubscribed']).validator('Subscription')
  Route.post('/subscription/cancel', 'ClassroomController.cancelSubscription').validator('CancelSubscription')
  Route.get('/course/goto', 'ClassroomController.gotoCourse')
  Route.get('/goto', 'ClassroomController.gotoClassroom')
}).prefix('/api/classroom').middleware(['auth:jwt', 'isStudent', 'isVerifiedAccount'])

Route.group(() => {
  Route.get('/course/enrolled', 'ClassroomController.getEnrolledCourses')
}).prefix('/api/classroom').middleware(['auth:jwt', 'isStudent', 'isEmailVerified', 'isLoginProfileComplete'])

//Cart Routes
//------------------------
Route.group(() => {
  Route.get('/', 'CartController.viewCart');
  Route.post('/item', 'CartController.addToCart').validator('CartItems');
  Route.post('/item/remove', 'CartController.removeFromCart').validator('CartItems');
}).prefix('/api/cart').middleware(['auth:jwt', 'isStudent']);

//Checkout Routes
//------------------------
Route.group(() => {
  Route.post('/', 'CheckoutController.checkout')
  Route.post('/course', 'CheckoutController.checkoutSingleCourse').validator('BuyNow')
}).prefix('/api/checkout').middleware(['auth:jwt', 'isStudent', 'isVerifiedAccount'])
