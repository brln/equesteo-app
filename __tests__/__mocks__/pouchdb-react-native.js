export default class PouchDB {
  constructor (name, opts) { }

  put () {
    return Promise.resolve({rev: 'somerev'})
  }
}
