import { Map } from 'immutable'
import { Alert } from 'react-native'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'

import { brand } from '../colors'
import Training from '../components/Training/Training'
import functional from '../actions/functional'
import { logRender } from '../helpers'
import { RIDE } from '../screens/consts/main'
import { EqNavigation } from '../services'
import { viewAllRidersButUser, viewTrainings } from "../dataViews/dataViews"

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
    this.settingsModalToggle = this.settingsModalToggle.bind(this)
    this.showRide = this.showRide.bind(this)

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
      return this.props.dispatch(functional.loadSingleRide(ride.get('rideID'))).then(() => {
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

  render() {
    logRender('TrainingContainer')
    const trainings = viewTrainings(
      this.props.trainings,
      this.props.users,
      this.props.rides,
      this.props.rideHorses,
      this.props.horses,
      this.props.horseUsers,
    ).get(this.props.userID) || Map()
    const riders = viewAllRidersButUser(
      this.props.trainings,
      this.props.users,
      this.props.rides,
      this.props.rideHorses,
      this.props.horses,
      this.props.horseUsers,
    ).get(this.props.userID) || Map()
    return (
      <Training
        horses={this.props.horses}
        horseUsers={this.props.horseUsers}
        loadingRide={this.state.loadingRide}
        riders={riders}
        settingsModalOpen={this.state.settingsModalOpen}
        settingsModalToggle={this.settingsModalToggle}
        showRide={this.showRide}
        trainings={trainings}
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
    rideElevations: pouchState.get('rideElevations'),
    rideHorses: pouchState.get('rideHorses'),
    trainings: pouchState.get('trainings'),
    user: pouchState.getIn(['users', userID]),
    users: pouchState.get('users'),
    userID,
  }
}

export default  connect(mapStateToProps)(TrainingContainer)
