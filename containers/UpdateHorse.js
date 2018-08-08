import { Map } from 'immutable'
import React, { Component } from 'react'
import { connect } from 'react-redux';

import UpdateHorse from '../components/UpdateHorse/UpdateHorse'
import { createHorse, updateHorse, uploadHorsePhoto } from '../actions'
import NavigatorComponent from './NavigatorComponent'
import { generateUUID, logRender, unixTimeNow } from '../helpers'

class UpdateHorseContainer extends NavigatorComponent {
  static navigatorButtons = {
    leftButtons: [],
    rightButtons: [
      {
        id: 'save',
        title: 'Save',
      },
    ],
  }

  constructor (props) {
    super(props)
    this.state = {
      userMadeChanges: false,
      horse: null,
      newPhotos: []
    }
    this.changeHorseDetails = this.changeHorseDetails.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent)
    this.uploadPhoto = this.uploadPhoto.bind(this)
  }

  static getDerivedStateFromProps (props, state) {
    let nextState = null
    if (!state.horse || props.horse.get('_rev') !== state.horse.get('_rev')) {
      nextState = {
        horse: props.horse,
        userMadeChanges: false
      }
    }
    return nextState
  }

  onNavigatorEvent (event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'save') {
        if (this.props.newHorse) {
          const newProps = Map({
            _id:  `${this.props.userID.toString()}_${(new Date).getTime().toString()}`,
            userID: this.props.userID
          })
          const withNewProps = this.state.horse.merge(newProps)
          this.props.dispatch(createHorse(withNewProps))
        } else {
          this.props.dispatch(updateHorse(this.state.horse))
        }
        this.props.navigator.pop()
      }
    }
  }

  changeHorseDetails (newDetails) {
    const newHorse = this.state.horse.merge(newDetails)
    this.setState({
      userMadeChanges: true,
      horse: newHorse
    })
  }

  uploadPhoto (uri) {
    if (this.props.newHorse) {
      let horse = this.state.horse
      let timestamp = unixTimeNow()
      let photoID = generateUUID()
      horse = horse.set('profilePhotoID', photoID)
      horse = horse.setIn(['photosByID', photoID], Map({timestamp, uri}))
      this.setState({
        horse,
        newPhotos: [...this.state.newPhotos, photoID]
      })
    } else {
      this.props.dispatch(uploadHorsePhoto(uri, this.state.horse.get('_id')))
    }

  }

  render() {
    logRender('UpdateHorseContainer')
    return (
      <UpdateHorse
        changeHorseDetails={this.changeHorseDetails}
        closeDeleteModal={this.closeDeleteModal}
        deleteHorse={this.deleteHorse}
        horse={this.state.horse}
        modalOpen={this.state.modalOpen}
        navigator={this.props.navigator}
        uploadPhoto={this.uploadPhoto}
        userID={this.props.userID}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  let horse = Map({
    photosByID: Map()
  })
  if (passedProps.horseID) {
    horse = state.getIn(['main' , 'horses', passedProps.horseID])
  }
  return {
    horse,
    userID: state.getIn(['main', 'localState', 'userID']),
    newHorse: passedProps.newHorse
  }
}

export default  connect(mapStateToProps)(UpdateHorseContainer)
