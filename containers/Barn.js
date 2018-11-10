import React from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'

import { createHorse } from '../actions'
import Barn from '../components/Barn/Barn'
import BackgroundComponent from '../components/BackgroundComponent'
import { brand } from '../colors'
import { logRender } from '../helpers'
import { HORSE_PROFILE, UPDATE_HORSE } from '../screens'

class BarnContainer extends BackgroundComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "My Barn",
          color: 'white',
          fontSize: 20
        },
        background: {
          color: brand,
        },
        backButton: {
          color: 'white'
        },
        elevation: 0
      },
      layout: {
        orientation: ['portrait']
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
        title: horse.get('name'),
        passProps: {
          horse,
          ownerID
        },
      }
    })
  }

  newHorse () {
    const horseID = `${this.props.userID.toString()}_${(new Date).getTime().toString()}`
    const horseUserID = `${this.props.userID}_${horseID}`
    this.props.dispatch(createHorse(horseID, horseUserID, this.props.userID))
    Navigation.push(this.props.componentId, {
      component: {
        name: UPDATE_HORSE,
        title: 'New Horse',
        passProps: {
          newHorse: true,
          horseID,
          horseUserID,
        }
      }
    })
  }

  yourHorses () {
    return this.props.horseUsers.valueSeq().filter((hu) => {
      return hu.get('userID') === this.props.userID && hu.get('deleted') !== true
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
        horsePhotos={this.props.horsePhotos}
        horseProfile={this.horseProfile}
        horseOwnerIDs={this.horseOwnerIDs()}
        newHorse={this.newHorse}
      />
    )
  }
}

function mapStateToProps (state) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  return {
    activeComponent: localState.get('activeComponent'),
    horseUsers: pouchState.get('horseUsers'),
    horses: pouchState.get('horses'),
    horsePhotos: pouchState.get('horsePhotos'),
    userID: localState.get('userID'),
    user: pouchState.getIn(['users', localState.get('userID')])
  }
}

export default  connect(mapStateToProps)(BarnContainer)
