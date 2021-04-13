'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Invoice = use('App/Models/Invoice')
const ResourceNotFoundException = use('App/Exceptions/ResourceNotFoundException')

class InvoiceIssuedByUser {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request }, next) {
    const invoice = await Invoice.query().where('invoice_ref', request.body.reference_number).where('user_id', request.user.id).first()
    if(!invoice)
      throw new ResourceNotFoundException('Invoice Not Found')
    await next()
  }
}

module.exports = InvoiceIssuedByUser
