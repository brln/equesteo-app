import React, { Component } from 'react'
import { connect } from 'react-redux';

import { signOut } from '../actions'
import Account from '../components/Account'
import { uploadProfilePhoto } from "../actions"

class AccountContainer extends Component {
  constructor (props) {
    super(props)
    this.signOut = this.signOut.bind(this)
    this.uploadProfilePhoto = this.uploadProfilePhoto.bind(this)
  }

  signOut () {
    this.props.dispatch(signOut())
  }

  uploadProfilePhoto (location) {
    this.props.dispatch(uploadProfilePhoto(location))
  }

  render() {
    return (
      <Account
        signOut={this.signOut}
        uploadProfilePhoto={this.uploadProfilePhoto}
        userData={this.props.userData}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    userData: state.userData
  }
}

export default connect(mapStateToProps)(AccountContainer)
