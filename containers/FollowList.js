import memoizeOne from 'memoize-one'
import { List } from 'immutable'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';

import { brand } from '../colors'
import { userName } from '../modelHelpers/user'
import { logRender } from '../helpers'
import { PROFILE } from '../screens'
import FollowList from '../components/FollowList'
import { EqNavigation } from '../services'

class FollowListContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        elevation: 0,
        backButton: {
          color: 'white'
        },
        title: {
          color: 'white',
        }
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
    this.showProfile = this.showProfile.bind(this)
    this.memoUsers = memoizeOne(this.users.bind(this))
  }

  showProfile (profileUser) {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: PROFILE,
        passProps: {
          profileUser,
        }
      }
    })
  }

  users (allUsers, userIDs) {
    return List(userIDs.map(userID => allUsers.get(userID))).sort((a, b) => {
      const aName = userName(a).toLowerCase()
      const bName = userName(b).toLowerCase()
      if (aName < bName) { return -1 }
      if (aName > bName) { return 1 }
    })
  }

  render() {
    logRender('FollowListContainer')
    return (
      <FollowList
        showProfile={this.showProfile}
        users={this.memoUsers(this.props.users, this.props.userIDs)}
        userPhotos={this.props.userPhotos}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const userIDs = passedProps.userIDs
  const pouchState = state.get('pouchRecords')
  return {
    userIDs,
    users: pouchState.get('users'),
    userPhotos: pouchState.get('userPhotos'),
  }
}

export default connect(mapStateToProps)(FollowListContainer)
