import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'

import { signOut, updateUser, uploadProfilePhoto } from "../actions"
import { brand } from '../colors'
import { logRender } from '../helpers'
import UpdateProfile from '../components/UpdateProfile'

class UpdateProfileContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "Edit My Account",
          color: 'white',
          fontSize: 20
        },
        background: {
          color: brand,
        },
        backButton: {
          color: 'white'
        },
        elevation: 0,
        rightButtons: [
          {
            id: 'save',
            text: 'Save',
            color: 'white'
          },
        ]
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  static getDerivedStateFromProps (props, state) {
    let nextState = null
    if (!state.user || (props.user && props.user.get('_rev') !== state.user.get('_rev'))) {
      nextState = {
        user: props.user,
        userMadeChanges: false
      }
    }
    return nextState
  }

  constructor (props) {
    super(props)
    this.state = {
      userMadeChanges: false,
      user: null,
    }
    this.changeAccountDetails = this.changeAccountDetails.bind(this)
    this.signOut = this.signOut.bind(this)
    this.uploadProfilePhoto = this.uploadProfilePhoto.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)

    Navigation.events().bindComponent(this);
  }

  changeAccountDetails (user) {
    this.setState({
      userMadeChanges: true,
      user
    })
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'save') {
      this.props.dispatch(updateUser(this.state.user))
      Navigation.pop(this.props.componentId)
    }
  }

  signOut () {
    this.props.dispatch(signOut())
  }

  uploadProfilePhoto (location) {
    this.props.dispatch(uploadProfilePhoto(location))
  }

  render() {
    logRender('UpdateProfileContainer')
    return (
      <UpdateProfile
        user={this.state.userMadeChanges ? this.state.user : this.props.user }
        changeAccountDetails={this.changeAccountDetails}
      />
    )
  }
}

function mapStateToProps (state) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  const user = pouchState.get('users').get(localState.get('userID'))
  return {
    user
  }
}

export default connect(mapStateToProps)(UpdateProfileContainer)
