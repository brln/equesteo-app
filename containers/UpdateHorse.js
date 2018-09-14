import { Map } from 'immutable'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'

import UpdateHorse from '../components/UpdateHorse/UpdateHorse'
import { createHorse, updateHorse, uploadHorsePhoto } from '../actions'
import { brand } from '../colors'
import { generateUUID, logRender, unixTimeNow } from '../helpers'

class UpdateHorseContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "Edit Horse",
          color: 'white',
        },
        background: {
          color: brand,
        },
        backButton: {
          color: 'white'
        },
        elevation: 0,
        rightButtons: [
          {
            id: 'save',
            text: 'Save',
            color: 'white'
          },
        ]
      }
    };
  }

  constructor (props) {
    super(props)
    this.state = {
      userMadeChanges: false,
      horse: null,
      newPhotos: []
    }
    this.changeHorseDetails = this.changeHorseDetails.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)

    Navigation.events().bindComponent(this);
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

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'save') {
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
      Navigation.pop(this.props.componentId)
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
