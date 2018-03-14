import React, { Component } from 'react'
import { connect } from 'react-redux';
import { API_URL } from 'react-native-dotenv'

import { discardRide, saveRide, startRide } from '../actions'
import RideDetails from '../components/RideRecorder/RideDetails'

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
    this.state = {
      rideName: null,
      horseID: null,
    }
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

  onNavigatorEvent (event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'save') {
        this.saveRide()
      } else if (event.id === 'discard') {
         this.props.dispatch(discardRide())
      }
    }
  }

  saveRide () {
    let horseID = this.state.horseID
    if (!horseID && this.props.horses.length > 0) {
      horseID = this.props.horses[0].id
    }
    this.props.dispatch(saveRide({
      elapsed_time_secs: this.props.elapsedTime,
      name: this.state.rideName,
      horseID: horseID,
    }))
    this.props.navigator.dismissModal({animationType: 'none'})
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
  }
}

export default  connect(mapStateToProps)(RideDetailsContainer)
