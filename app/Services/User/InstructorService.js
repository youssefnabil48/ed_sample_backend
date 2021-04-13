'use strict'

const User = use('App/Models/User')
const Instructor = use('App/Models/Instructor')
const ResourceNotFoundException = use('App/Exceptions/ResourceNotFoundException')
const TalentLMS = use('TalentLms')
const BadRequestException = use('App/Exceptions/BadRequestException')
const ConflictException = use('App/Exceptions/ConflictException')
const Helpers = use('App/Helpers/Helpers');
const Messages = use('App/Constants/Messages');
const Codes = use('App/Constants/Codes');
const UserService = use('App/Services/User/UserService')

class InstructorService extends UserService {

  async create(userObj) {
    let {instructor, ...user} = userObj
    user.uuid = Helpers.generateUUID()
    user.username = Helpers.generateUsername(user.first_name, user.last_name)
    let newUser = null
    try{
      newUser = await super.createUser(user);
      await newUser.instructor().create(instructor)
      return newUser
    }catch (error){
      if (Number(error.code) === Number(Codes.Error.Database.uniqueViolation)) {
        await newUser.delete()
        switch (error.constraint) {
          case 'users_phone_number_unique':
            throw new ConflictException(Messages.user.error.phoneUnique)
          case 'users_email_unique':
            throw new ConflictException(Messages.user.error.emailUnique)
          case 'instructors_label_unique':
            throw new ConflictException('Instructor Label already exists')
          case 'instructors_branch_id_unique':
            throw new ConflictException('Instructor Branch ID already exists')
          case 'instructors_branch_name_unique':
            throw new ConflictException('Instructor Branch Name already exists')
        }
      }
      throw error;
    }
  }

  async updateInstructor(id, userObj) {
    let {instructor, ...user} = userObj
    try{
      await User.query().where('id', id).update(user)
      await Instructor.query().where('user_id', id).update(instructor)
    }
    catch (error) {
      if (Number(error.code) === Number(Codes.Error.Database.uniqueViolation)) {
        switch (error.constraint) {
          case 'users_phone_number_unique':
            throw new ConflictException(Messages.user.error.phoneUnique)
          case 'users_email_unique':
            throw new ConflictException(Messages.user.error.emailUnique)
          case 'instructors_label_unique':
            throw new ConflictException('Instructor Label already exists')
          case 'instructors_branch_id_unique':
            throw new ConflictException('Instructor Branch ID already exists')
          case 'instructors_branch_name_unique':
            throw new ConflictException('Instructor Branch Name already exists')
        }
      }
    }
  }

  async getAll(){
    return User.query().has('instructor').with('instructor').setHidden(['id', 'phone_number', 'password']).fetch()
  }

  async get(label){
    const instructor = await Instructor.query().with('user').with('classrooms.instructor.user')
      .with('classrooms.category')
      .with('classrooms.courses')
      .with('certifications').with('experiences')
      .where('label', label).first()
    if(!instructor)
      throw new ResourceNotFoundException('Instructor Not Found')
    return instructor
  }

  async getStudentLmsProfile(student){
    return await TalentLMS.Users.getUserById(student.lms_id)
  }

}

module.exports = InstructorService
