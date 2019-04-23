import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { Keyboard } from 'react-native'
import { connect } from 'react-redux';

import { searchForFriends } from "../actions/functional"
import { clearSearch } from "../actions/standard"
import { brand } from '../colors'
import { logError, logRender } from '../helpers'
import { PROFILE } from '../screens'
import FindPeople from '../components/FindPeople'
import { EqNavigation } from '../services'

class FindPeopleContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "Find Friends",
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
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
    this.search = this.search.bind(this)
    this.showProfile = this.showProfile.bind(this)

    Navigation.events().bindComponent(this)
  }

  componentWillUnmount () {
    Keyboard.dismiss()
  }

  showProfile (profileUser) {
    let showUser = this.props.allUsers.get(profileUser.get('_id'))
    if (!showUser) {
      showUser = profileUser
    }
    EqNavigation.push(this.props.componentId, {
      component: {
        name: PROFILE,
        passProps: {
          profileUser: showUser,
          profilePhotoURL: profileUser.get('profilePhotoURL')
        }
      }
    })
  }

  search (phrase) {
    this.props.dispatch(searchForFriends(phrase))
  }

  render() {
    logRender('FindPeopleContainer')
    return (
      <FindPeople
        allUsers={this.props.allUsers}
        search={this.search}
        showProfile={this.showProfile}
        user={this.props.user}
        userSearchResults={this.props.userSearchResults}
      />
    )
  }
}

function mapStateToProps (state) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  return {
    allUsers: pouchState.get('users'),
    user: pouchState.getIn(['users', localState.get('userID')]),
    userSearchResults: localState.get('userSearchResults')
  }
}

export default connect(mapStateToProps)(FindPeopleContainer)
