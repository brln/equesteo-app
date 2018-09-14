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
        id: PROFILE,
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
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const userIDs = passedProps.userIDs
  const mainState = state.get('main')
  return {
    users: List(userIDs.map(userID => mainState.getIn(['users', userID])))
  }
}

export default connect(mapStateToProps)(FollowListContainer)
