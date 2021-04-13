'use strict'

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const User = use('App/Models/User')
const Helpers = use('App/Helpers/Helpers')

class UserSeeder {
  async run () {
    const user1 = await User.create({
      uuid: Helpers.generateUUID(),
      username: 'mh23476',
      first_name : "Marwan",
      last_name : "Hussein",
      email : "marwanamrhuss@gmail.com",
      phone_number : "01129000441",
      password : "marwan333"
    })
    const student1 = await user1.student().create({})
    student1.address().create({
      building_number:  3,
      floor: 3,
      apartment: 54,
      street: 'gaber',
      governorate: 'giza',
      city: 'giza',
      country: 'egypt',
      postal_code: '12611'
    })
    await student1.wallet().create({})
    await student1.cart().create({})

    const user2 = await User.create({
      uuid: Helpers.generateUUID(),
      first_name : "Youssef",
      last_name : "Hussein",
      username: 'yh23476',
      email : "youssef.nabil.mustafa@gmail.com",
      phone_number : "01069285812",
      password : "marwan333"
    })
    const student2 = await user2.student().create({})
    student2.address().create({
      building_number:  3,
      floor: 3,
      apartment: 54,
      street: 'gaber',
      governorate: 'giza',
      city: 'giza',
      country: 'egypt',
      postal_code: '12611'
    })
    await student2.wallet().create({})
    await student2.cart().create({})

    const user3 = await User.create({
      uuid: Helpers.generateUUID(),
      first_name : "Sara",
      last_name : "Sheemi",
      username: 'ss23476',
      email : "sosopanther@gmail.com",
      phone_number : "01152485963",
      password : "marwan333"
    })
    await user3.instructor().create({
      label: 'sara',
      branch_id: '1',
      branch_name: 'sara'
    })
  }

}

module.exports = UserSeeder
