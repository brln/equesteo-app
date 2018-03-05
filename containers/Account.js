import React, { Component } from 'react'
import { connect } from 'react-redux';

import { signOut } from '../actions'
import Account from '../components/Account'

class AccountContainer extends Component {
  constructor (props) {
    super(props)
    this.signOut = this.signOut.bind(this)
  }

  signOut () {
    this.props.dispatch(signOut())
  }

  render() {
    return (
      <Account
        signOut={this.signOut}
      />
    )
  }
}

function mapStateToProps (state) {
  return state
}

export default  connect(mapStateToProps)(AccountContainer)
