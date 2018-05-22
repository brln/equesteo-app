import React, { Component } from 'react'
import { connect } from 'react-redux';

import Horse from '../components/Horse'
import { uploadHorsePhoto } from '../actions'

class HorseContainer extends Component {
  constructor (props) {
    super(props)
    this.uploadPhoto = this.uploadPhoto.bind(this)
  }

  uploadPhoto (location) {
    this.props.dispatch(uploadHorsePhoto(location, this.props.horseID))
  }

  render() {
    return (
      <Horse
        horse={this.props.horse}
        uploadPhoto={this.uploadPhoto}
        userID={this.props.userID}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  let horse = null
  for (let eachHorse of state.horses) {
    if (eachHorse._id === passedProps.horseID) {
      horse = eachHorse
      break;
    }
  }
  return {
    horse,
    userID: state.localState.userID,
  }
}

export default  connect(mapStateToProps)(HorseContainer)
