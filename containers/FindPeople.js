import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';

import { searchForFriends } from "../actions"
import { brand } from '../colors'
import { logRender } from '../helpers'
import { PROFILE } from '../screens'
import FindPeople from '../components/FindPeople'

class FindPeopleContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "Find People",
          color: 'white',
        },
        background: {
          color: brand,
        },
        elevation: 0,
        backButton: {
          color: 'white'
        }
      }
    };
  }

  constructor (props) {
    super(props)
    this.search = this.search.bind(this)
    this.showProfile = this.showProfile.bind(this)
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
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  return {
    allUsers: mainState.get('users'),
    user: mainState.getIn(['users', localState.get('userID')]),
    userSearchResults: localState.get('userSearchResults')
  }
}

export default connect(mapStateToProps)(FindPeopleContainer)
