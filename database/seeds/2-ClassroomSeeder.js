'use strict'

/*
|--------------------------------------------------------------------------
| ClassroomSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const Classroom = use('App/Models/Classroom')
const Instructor = use('App/Models/Instructor')
const Category = use('App/Models/Category')

class ClassroomSeeder {
  async run () {

    //categories
    const category1 = await Category.create({name: 'chemistry'})
    const category2 = await Category.create({name: 'arabic'})

    //fetch instructor
    const instructor = await Instructor.first()

    //classroom
    const classroom1 = await Classroom.create({
      instructor_id : instructor.user_id,
      category_id: category1.id,
      label: 'chemistryOnline',
      title: 'chem online',
      description: 'chem online',
      price: 50
    })

    const course1 = await classroom1.courses().create({
      name: 'week1',
      price: 50.0,
      number: 1,
      status: false
    })

    const course2 = await classroom1.courses().create({
      name: 'week2',
      price: 50.0,
      number: 2,
      status: false
    })

    const course3 = await classroom1.courses().create({
      name: 'week3',
      price: 50.0,
      number: 3,
      status: false
    })

    await course1.units().create({
      name: 'unit1',
      type: 'content',
      url: 'dshfusdhfoisdhfoi'
    })

    await course2.units().create({
      name: 'unit2',
      type: 'content',
      url: 'dshfusdhfoisdhfoi'
    })

    await course3.units().create({
      name: 'unit3',
      type: 'content',
      url: 'dshfusdhfoisdhfoi'
    })
  }
}

module.exports = ClassroomSeeder
