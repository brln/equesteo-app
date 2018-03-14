import React, { Component } from 'react'
import { connect } from 'react-redux';
import { API_URL } from 'react-native-dotenv'
import moment from 'moment'

import { changeScreen, discardRide, localSaveRide } from '../actions'
import RideDetails from '../components/RideRecorder/RideDetails'
import { RIDES } from '../screens'

class RideDetailsContainer extends Component {
  static navigatorButtons = {
    rightButtons: [
      {
        id: 'save',
        title: 'Save',
      },
      {
        id: 'discard',
        title: 'Discard'
      },
    ],
  }

  constructor (props) {
    super(props)
    const rideName = `${props.currentRide.distance.toFixed(2)} mi ride on ${moment(props.currentRide.startTime).format('MMMM DD YYYY')}`
    this.state = {
      rideName: rideName,
      horseID: null,
    }
    this.doneOnPage = this.doneOnPage.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.changeHorseID = this.changeHorseID.bind(this)
    this.changeRideName = this.changeRideName.bind(this)
    this.saveRide = this.saveRide.bind(this)

    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  changeRideName (text) {
    this.setState({
      rideName: text
    })
  }

  changeHorseID (horseID) {
    this.setState({
      horseID: horseID
    })
  }

  doneOnPage () {
    this.props.navigator.popToRoot({animated: false, animationType: 'none'})
    this.props.dispatch(changeScreen(RIDES))
  }

  onNavigatorEvent (event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'save') {
        this.saveRide()
      } else if (event.id === 'discard') {
        this.props.dispatch(discardRide())
        this.doneOnPage()
      }
    }
  }

  saveRide () {
    let horseID = this.state.horseID
    if (!horseID && this.props.horses.length > 0) {
      horseID = this.props.horses[0].id
    }
    this.props.dispatch(localSaveRide({
      elapsedTimeSecs: this.props.elapsedTime,
      name: this.state.rideName,
      horseID: horseID,
    }))
    this.doneOnPage()
  }

  render() {
    return (
      <RideDetails
        horses={this.props.horses}
        horseID={this.state.horseID}
        changeRideName={this.changeRideName}
        changeHorseID={this.changeHorseID}
        rideName={this.state.rideName}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    horses: state.horses,
    currentRide: state.currentRide
  }
}

export default  connect(mapStateToProps)(RideDetailsContainer)
