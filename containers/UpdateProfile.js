import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'
import { Keyboard } from 'react-native'

import { persistUser, signOut, userUpdated, uploadProfilePhoto } from "../actions"
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
        leftButtons: [
          {
            id: 'back',
            icon: require('../img/back-arrow.png'),
            color: 'white'
          }
        ],
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
    if (!state.cachedUser && props.user) {
      return {
        cachedUser: props.user,
      }
    }
    return state
  }

  constructor (props) {
    super(props)
    this.state = {
      cachedUser: null
    }
    this.changeAccountDetails = this.changeAccountDetails.bind(this)
    this.signOut = this.signOut.bind(this)
    this.uploadProfilePhoto = this.uploadProfilePhoto.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)

    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'save') {
      this.props.dispatch(persistUser(this.props.user.get('_id')))
    } else if (buttonId === 'back') {
      this.props.dispatch(userUpdated(this.state.cachedUser))
    }
    Navigation.pop(this.props.componentId)
    Keyboard.dismiss()
  }

  changeAccountDetails (user) {
    this.props.dispatch(userUpdated(user))
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
        user={ this.props.user }
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
