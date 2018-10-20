import { Map } from 'immutable'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'

import UpdateHorse from '../components/UpdateHorse/UpdateHorse'
import { createHorse, updateHorse, uploadHorsePhoto, updateHorseUser } from '../actions'
import { brand } from '../colors'
import { generateUUID, logRender, unixTimeNow } from '../helpers'

class UpdateHorseContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "Edit Horse",
          color: 'white',
          fontSize: 20
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
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
    this.state = {
      userChangedHorse: false,
      horse: null,
      userChangedDefault: false,
      horseUser: null,
      newPhotos: []
    }
    this.changeHorseDetails = this.changeHorseDetails.bind(this)
    this.commitDefaultHorse = this.commitDefaultHorse.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.setDefaultHorse = this.setDefaultHorse.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)

    Navigation.events().bindComponent(this);
  }

  static getDerivedStateFromProps (props, state) {
    let nextState = null
    if (!state.horse && !state.horseUser && props.horse && props.horseUser) {
      nextState = {
        ...state,
        horse: props.horse,
        horseUser: props.horseUser
      }
    }
    return nextState
  }

  async navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'save') {
      if (this.props.newHorse) {
        const newProps = Map({
          _id: `${this.props.userID.toString()}_${(new Date).getTime().toString()}`,
          userID: this.props.userID
        })
        const withNewProps = this.state.horse.merge(newProps)
        this.props.dispatch(createHorse(withNewProps, !!this.state.newDefault))
      } else {
        if (this.state.userChangedDefault) {
          await this.commitDefaultHorse()
        }
        if (this.state.userChangedHorse) {
          // There is some weird race condition here where if you
          // don't await, and you change a property on the horse and
          // also update it's default status, then reload, it will
          // just disappear. When it writes the records to PouchDB
          // They are losing everything except the id and rev.
          //
          // I spent hours and have no idea wtf, but
          // this solves the problem (until it doesn't. sorry.).
          //
          // Probably try to get rid of this when you upgrade
          // pouchdb-react-native from 6.4.1
          setTimeout(() => {
            this.props.dispatch(updateHorse(this.state.horse))
          }, 300)


        }
      }

      Navigation.pop(this.props.componentId)
    }
  }

  changeHorseDetails (newDetails) {
    const newHorse = this.state.horse.merge(newDetails)
    this.setState({
      userChangedHorse: true,
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

  setDefaultHorse () {
    this.setState({
      horseUser: this.state.horseUser.set('rideDefault', !this.state.horseUser.get('rideDefault')),
      userChangedDefault: true
    })
  }

  async commitDefaultHorse () {
    await this.props.dispatch(updateHorseUser(this.state.horseUser))

    if (this.state.horseUser.get('rideDefault')) {
      this.props.horseUsers.valueSeq().forEach(async horseUser => {
        if (horseUser !== this.props.horseUser
          && horseUser.get('userID') === this.props.userID
          && horseUser.get('rideDefault') === true) {
          const withoutDefault = horseUser.set('rideDefault', false)
          await this.props.dispatch(updateHorseUser(withoutDefault))
        }
      })
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
        horseUser={this.state.horseUser}
        modalOpen={this.state.modalOpen}
        setDefaultHorse={this.setDefaultHorse}
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
  let horseUser = Map({})
  if (passedProps.horseID) {
    horse = state.getIn(['main' , 'horses', passedProps.horseID])
    horseUser = state.getIn([
      'main',
      'horseUsers',
      `${state.getIn(['main', 'localState', 'userID'])}_${passedProps.horseID}`
    ])
  }
  return {
    horse,
    horseUser,
    horseUsers: state.getIn(['main', 'horseUsers']),
    userID: state.getIn(['main', 'localState', 'userID']),
    newHorse: passedProps.newHorse
  }
}

export default  connect(mapStateToProps)(UpdateHorseContainer)
