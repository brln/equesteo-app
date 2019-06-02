import { Alert } from 'react-native'
import { List, Map } from 'immutable'
import memoizeOne from 'memoize-one'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'

import { brand } from '../colors'
import Training from '../components/Training/Training'
import { loadSingleRide } from '../actions/functional'
import { logRender } from '../helpers'
import { RIDE } from '../screens/main'
import { EqNavigation, PouchCouch } from '../services'

class TrainingContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "Training",
          color: 'white',
          fontSize: 20
        },
        background: {
          color: brand,
        },
        elevation: 0,
        backButton: {
          color: 'white'
        },
        rightButtons: [{
          id: 'settings',
          text: 'Filters',
          color: 'white'
        }],
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      settingsModalOpen: false,
      loadingRide: false
    }

    this.rideHorses = this.rideHorses.bind(this)
    this.settingsModalToggle = this.settingsModalToggle.bind(this)
    this.showRide = this.showRide.bind(this)
    this.memoTrainings = memoizeOne(this.trainings.bind(this))
    this.memoAllRidersButYou = memoizeOne(this.allRidersButYou.bind(this))
    this.memoRideHorses = memoizeOne(this.rideHorses.bind(this))

    Navigation.events().bindComponent(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'settings') {
      this.settingsModalToggle(true)
    }
  }

  settingsModalToggle (open) {
    this.setState({
      settingsModalOpen: open
    })
  }


  showRide (ride) {
    if (this.props.rides.get(ride.get('rideID'))) {
      return EqNavigation.push(this.props.componentId, {
        component: {
          name: RIDE,
          passProps: {rideID: ride.get('rideID')}
        }
      }).catch(() => {})
    } else if (this.props.goodConnection) {
      this.setState({ loadingRide: true })
      return this.props.dispatch(loadSingleRide(ride.get('rideID'))).then(() => {
        this.setState({ loadingRide: false })
        return EqNavigation.push(this.props.componentId, {
          component: {
            name: RIDE,
            passProps: {rideID: ride.get('rideID')},
            options: {
              animations: {
                push: {
                  enabled: false
                }
              }
            }
          },

        })
      }).catch(() => {
        setTimeout(() => {
          this.setState({ loadingRide: false })
          setTimeout(() => {
            Alert.alert(
              'Not Available',
              'We can\'t load this ride for some reason. \n\n Please contact us if you keep seeing this. info@equesteo.com',
              [{ text: 'OK' }],
              {cancelable: true}
            )
          }, 500)
        }, 500)
      })
    } else {
      Alert.alert(
        'Not Available',
        'This ride data is not available offline. \n\n Please try again when you have service.',
        [{ text: 'OK' }],
        {cancelable: true}
      )
      return Promise.reject()
    }
  }

  allRidersButYou (trainings, users, userID) {
    let peopleWhoRideYourHorses = Map()
    this.trainings(trainings, userID).forEach(ride => {
      if (ride.get('userID') !== userID) {
        peopleWhoRideYourHorses = peopleWhoRideYourHorses.set(
          ride.get('userID'),
          users.get(ride.get('userID'))
        )
      }
    })
    return peopleWhoRideYourHorses
  }

  rideHorses (rideHorses) {
    return rideHorses.filter(rh => {
      return rh.get('deleted') !== true
    })
  }

  trainings (trainings, userID) {
    return trainings.getIn([`${userID}_training`, 'rides']).filter(t => {
      return t.get('deleted') !== true
    })
  }

  render() {
    logRender('TrainingContainer')
    return (
      <Training
        horses={this.props.horses}
        horseUsers={this.props.horseUsers}
        loadingRide={this.state.loadingRide}
        rideHorses={this.memoRideHorses(this.props.rideHorses)}
        riders={this.memoAllRidersButYou(this.props.trainings, this.props.users, this.props.userID)}
        settingsModalOpen={this.state.settingsModalOpen}
        settingsModalToggle={this.settingsModalToggle}
        showRide={this.showRide}
        trainings={this.memoTrainings(this.props.trainings, this.props.userID)}
        user={this.props.user}
        userID={this.props.userID}
      />
    )
  }
}

function mapStateToProps (state) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  const userID = localState.get('userID')
  return {
    goodConnection: localState.get('goodConnection'),
    horses: pouchState.get('horses'),
    horseUsers: pouchState.get('horseUsers'),
    rides: pouchState.get('rides'),
    rideHorses: pouchState.get('rideHorses'),
    trainings: pouchState.get('trainings'),
    user: pouchState.getIn(['users', userID]),
    users: pouchState.get('users'),
    userID,
  }
}

export default  connect(mapStateToProps)(TrainingContainer)
