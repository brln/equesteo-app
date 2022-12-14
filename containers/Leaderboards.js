import memoize from 'memoize-one'
import React from 'react'
import { connect } from 'react-redux';

import BackgroundComponent from '../components/BackgroundComponent'
import { brand } from '../colors'
import { logRender } from '../helpers'
import Leaderboards from '../components/Leaderboards/Leaderboards'
import { HORSE_PROFILE, PROFILE } from '../screens/consts/main'
import { EqNavigation } from '../services'
import { viewHorseOwnerIDs } from "../dataViews/dataViews"

class LeaderboardsContainer extends BackgroundComponent {
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
          fontSize: 20,
          text: "Leaderboards"
        }
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      loading: true
    }
    this.showProfile = this.showProfile.bind(this)
    this.showHorseProfile = this.showHorseProfile.bind(this)
  }

  showHorseProfile (horse, ownerID) {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: HORSE_PROFILE,
        passProps: {
          horse,
          ownerID,
          popBackTo: this.props.componentId
        }
      }
    }).catch(() => {})
  }

  showProfile (profileUser) {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: PROFILE,
        passProps: {
          profileUser,
          leaderboardProfile: true
        }
      }
    }).catch(() => {})
  }

  render() {
    logRender('Leaderboards Container')
    return (
      <Leaderboards
        horses={this.props.horses}
        horseOwnerIDs={viewHorseOwnerIDs(this.props.horseUsers)}
        horsePhotos={this.props.horsePhotos}
        leaderboards={this.props.leaderboards.get('values')}
        showHorseProfile={this.showHorseProfile}
        showProfile={this.showProfile}
        userPhotos={this.props.userPhotos}
        users={this.props.users}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  const userID = localState.get('userID')

  return {
    horsePhotos: pouchState.get('horsePhotos'),
    horseUsers: pouchState.get('horseUsers'),
    horses: pouchState.get('horses'),
    leaderboards: pouchState.get('leaderboards'),
    userID,
    userPhotos: pouchState.get('userPhotos'),
    users: pouchState.get('users')
  }
}

export default connect(mapStateToProps)(LeaderboardsContainer)
