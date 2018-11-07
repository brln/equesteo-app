import { List } from 'immutable'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'

import { brand } from '../colors'
import { logRender } from '../helpers'
import { PROFILE } from '../screens'
import FollowList from '../components/FollowList'

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
  }

  showProfile (profileUser) {
    Navigation.push(this.props.componentId, {
      component: {
        name: PROFILE,
        passProps: {
          profileUser,
        }
      }
    })
  }

  render() {
    logRender('FollowListContainer')
    return (
      <FollowList
        showProfile={this.showProfile}
        users={this.props.users}
        userPhotos={this.props.userPhotos}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const userIDs = passedProps.userIDs
  const pouchState = state.get('pouchRecords')
  return {
    users: List(userIDs.map(userID => pouchState.getIn(['users', userID]))),
    userPhotos: pouchState.get('userPhotos'),
  }
}

export default connect(mapStateToProps)(FollowListContainer)
