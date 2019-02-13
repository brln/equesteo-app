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
        leftButtons: [
          {
            id: 'back',
            icon: require('../img/back-arrow.png'),
            color: 'white'
          }
        ],
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.search = this.search.bind(this)
    this.showProfile = this.showProfile.bind(this)

    Navigation.events().bindComponent(this)
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'back') {
      Keyboard.dismiss()
      Navigation.pop(this.props.componentId).then(() => {
        this.props.dispatch(clearSearch())
      }).catch(e => logError(e, 'FindPeople.navigationButtonPressed'))
    }
  }

  showProfile (profileUser) {
    let showUser = this.props.allUsers.get(profileUser.get('_id'))
    if (!showUser) {
      showUser = profileUser
    }
    Navigation.push(this.props.componentId, {
      component: {
        name: PROFILE,
        passProps: {
          profileUser: showUser,
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
