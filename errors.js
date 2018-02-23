export class UnauthorizedError extends Error {
  constructor (message, ...params) {
    super(...params)
    this.message = message

    // Javascript hacks to be able to call instanceof
    this.constructor = UnauthorizedError
    this.__proto__ = UnauthorizedError.prototype
  }
}

export class BadRequestError extends Error {
  constructor (message, ...params) {
    super(...params)
    this.message = message

    // Javascript hacks to be able to call instanceof
    this.constructor = BadRequestError
    this.__proto__ = BadRequestError.prototype
  }
}