export class UnauthorizedError extends Error {
  constructor (message, ...params) {
    super(...params)
    this.message = message
    this.status = 401

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

export class BadResponseError extends Error {
  constructor (message, ...params) {
    super(...params)
    this.message = message

    // Javascript hacks to be able to call instanceof
    this.constructor = BadRequestError
    this.__proto__ = BadRequestError.prototype
  }
}

export class UnknownError extends Error {
  constructor (message, ...params) {
    super(...params)
    this.message = message

    // Javascript hacks to be able to call instanceof
    this.constructor = UnknownError
    this.__proto__ = UnknownError.prototype
  }
}

export class NotConnectedError extends Error {
  constructor (message, ...params) {
    super(...params)
    this.message = message

    // Javascript hacks to be able to call instanceof
    this.constructor = NotConnectedError
    this.__proto__ = NotConnectedError.prototype
  }
}
