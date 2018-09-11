import { Map } from 'immutable'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'

import { brand } from '../colors'
import Training from '../components/Training/Training'
import { logRender } from '../helpers'
import { RIDE } from '../screens'

class TrainingContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "Training",
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
    }
  }

  constructor (props) {
    super(props)
    this.allRidersButYou = this.allRidersButYou.bind(this)
    this.allRidesOnYourHorses = this.allRidesOnYourHorses.bind(this)
    this.showRide = this.showRide.bind(this)
    this.yourHorses = this.yourHorses.bind(this)
  }

  showRide (ride) {
    Navigation.push(this.props.componentId, {
      component: {
        name: RIDE,
        id: RIDE,
        passProps: {rideID: ride.get('_id')}
      }
    });
  }

  yourHorses () {
    return this.props.horseUsers.valueSeq().filter((hu) => {
      return (hu.get('userID') === this.props.userID)
    }).map((hu) => {
      return this.props.horses.get(hu.get('horseID'))
    })
  }

  allRidesOnYourHorses () {
    const yourHorseIDs = this.yourHorses().valueSeq().map(h => h.get('_id'))
    return this.props.rides.valueSeq().filter((ride) => {
      return (
        yourHorseIDs.indexOf(ride.get('horseID')) >= 0
          || (ride.get('userID') === this.props.userID && ride.get('horseID') === null)
        ) && ride.get('deleted') !== true
    })
  }

  allRidersButYou () {
    const ridesOnYourHorses = this.allRidesOnYourHorses()
    let peopleWhoRideYourHorses = Map()
    ridesOnYourHorses.forEach(ride => {
      if (ride.get('userID') !== this.props.userID) {
        peopleWhoRideYourHorses = peopleWhoRideYourHorses.set(
          ride.get('userID'),
          this.props.users.get(ride.get('userID'))
        )
      }
    })
    return peopleWhoRideYourHorses
  }


  render() {
    logRender('SignupLoginContainer')
    return (
      <Training
        horses={this.yourHorses()}
        rides={this.allRidesOnYourHorses()}
        riders={this.allRidersButYou()}
        showRide={this.showRide}
        user={this.props.user}
        userID={this.props.userID}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  const userID = localState.get('userID')
  return {
    horses: mainState.get('horses'),
    horseUsers: mainState.get('horseUsers'),
    rides: mainState.get('rides'),
    user: mainState.getIn(['users', userID]),
    users: mainState.get('users'),
    userID,
  }
}

export default  connect(mapStateToProps)(TrainingContainer)
