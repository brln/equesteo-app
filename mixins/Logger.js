import functional from '../actions/functional'

export const Logger = {
  logError (e, id) {
    this.props.dispatch(functional.logError(e, id))
  },

  logInfo (info1, info2) {
    this.props.dispatch(functional.logInfo(info1, info2))
  }
}