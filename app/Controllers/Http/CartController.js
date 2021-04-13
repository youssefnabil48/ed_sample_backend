'use strict'

const CartService = use('App/Services/Cart/CartService')
const Http = use('App/Helpers/Http')

class CartController {

  constructor() {
    this.cartService = new CartService()
  }

  async viewCart({request, response}){
    const cart = await this.cartService.getUserCart(request.user)
    return Http.sendResponse(response, true, cart, 'User Cart')
  }

  async addToCart({request, response}){
    await this.cartService.addToCart(request.user, request.body.course_ids)
    return Http.sendResponse(response, true, null, 'Items added to cart')
  }

  async removeFromCart({request, response}){
    await this.cartService.removeFromCart(request.user, request.body.course_ids)
    return Http.sendResponse(response, true, null, 'Items removed to cart')
  }

}

module.exports = CartController
