import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'

import Barn from '../components/Barn/Barn'
import { brand } from '../colors'
import { logRender } from '../helpers'
import { HORSE_PROFILE, UPDATE_HORSE } from '../screens'

class BarnContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "My Barn",
          color: 'white',
        },
        background: {
          color: brand,
        },
        backButton: {
          color: 'white'
        },
        elevation: 0
      }
    };
  }

  constructor (props) {
    super(props)
    this.horseProfile = this.horseProfile.bind(this)
    this.newHorse = this.newHorse.bind(this)
    this.yourHorses = this.yourHorses.bind(this)
  }

  horseProfile (horse, ownerID) {
    Navigation.push(this.props.componentId, {
      component: {
        name: HORSE_PROFILE,
        id: HORSE_PROFILE,
        title: horse.get('name'),
        passProps: {
          horse,
          ownerID
        },
      }
    })
  }

  newHorse () {
    Navigation.push(this.props.componentId, {
      component: {
        name: UPDATE_HORSE,
        id: UPDATE_HORSE,
        title: 'New Horse',
        passProps: {
          newHorse: true
        }
      }
    })
  }

  yourHorses () {
    return this.props.horseUsers.valueSeq().filter((hu) => {
      return (hu.get('userID') === this.props.userID) && hu.get('deleted') !== true
    }).map((hu) => {
      return this.props.horses.get(hu.get('horseID'))
    })
  }

  horseOwnerIDs () {
    return this.props.horseUsers.filter(hu => {
      return hu.get('owner') === true
    }).mapEntries(([horseUserID, horseUser]) => {
      return [horseUser.get('horseID'), horseUser.get('userID')]
    })
  }

  render() {
    logRender('BarnContainer')
    return (
      <Barn
        horses={this.yourHorses()}
        horseProfile={this.horseProfile}
        horseOwnerIDs={this.horseOwnerIDs()}
        newHorse={this.newHorse}
      />
    )
  }
}

function mapStateToProps (state) {
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  return {
    horseUsers: mainState.get('horseUsers'),
    horses: mainState.get('horses'),
    userID: localState.get('userID'),
    user: state.getIn(['users', localState.get('userID')])
  }
}

export default  connect(mapStateToProps)(BarnContainer)
