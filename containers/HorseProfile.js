import React, { Component } from 'react'
import { connect } from 'react-redux';

import { addHorseUser, deleteHorseUser, uploadHorsePhoto } from '../actions'
import { UPDATE_HORSE } from '../screens'
import HorseProfile from '../components/HorseProfile/HorseProfile'
import NavigatorComponent from './NavigatorComponent'
import { logRender } from '../helpers'

class HorseProfileContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.state = {
      modalOpen: false
    }
    this.addRider = this.addRider.bind(this)
    this.closeDeleteModal = this.closeDeleteModal.bind(this)
    this.deleteHorse = this.deleteHorse.bind(this)
    this.horseOwner = this.horseOwner.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent)
    this.thisHorsesRides = this.thisHorsesRides.bind(this)
    this.thisHorsesRiders = this.thisHorsesRiders.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)
  }

  addRider () {
    this.props.dispatch(addHorseUser(this.props.horse, this.props.user))
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.horse.name !== this.props.horse.name) {
      this.props.navigator.setTitle({title: nextProps.horse.name})
    }
  }

  closeDeleteModal () {
    this.setState({
      modalOpen: false
    })
  }

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'edit') {
        this.props.navigator.dismissAllModals()
        this.props.navigator.push({
          screen: UPDATE_HORSE,
          title: 'Update Horse',
          passProps: {
            horseID: this.props.horse.get('_id'),
            newHorse: false
          },
          animationType: 'slide-up',
        });
      } else if (event.id === 'archive') {
        this.setState({modalOpen: true})
      }
    }
  }

  deleteHorse () {
    this.props.dispatch(deleteHorseUser(this.props.horse.get('_id'), this.props.user.get('_id')))
    this.props.navigator.pop()
  }

  uploadPhoto (location) {
    this.props.dispatch(uploadHorsePhoto(location, this.props.horse.get('_id')))
  }

  thisHorsesRides () {
    return this.props.rides.valueSeq().reduce((accum, r) => {
      if (r.get('horseID') === this.props.horse.get('_id')) {
        accum.push(r)
      }
      return accum
    }, [])
  }

  thisHorsesRiders () {
    return this.props.horseUsers.valueSeq().filter((hu) => {
      return (hu.get('horseID') === this.props.horse.get('_id')) && hu.get('deleted') !== true
    }).map((hu) => {
      return this.props.users.get(hu.get('userID'))
    })
  }

  horseOwner () {
    let user
    this.props.horseUsers.valueSeq().forEach((horseUser) => {
      if (horseUser.get('owner') === true && horseUser.get('horseID') === this.props.horse.get('_id')) {
        user = this.props.users.get(horseUser.get('userID'))
      }
    })
    if (!user) {
      throw Error('Horse has no owner.')
    }
    return user
  }

  render() {
    logRender('HorseProfileContainer')
    return (
      <HorseProfile
        addRider={this.addRider}
        closeDeleteModal={this.closeDeleteModal}
        deleteHorse={this.deleteHorse}
        horse={this.props.horse}
        horseOwner={this.horseOwner()}
        modalOpen={this.state.modalOpen}
        navigator={this.props.navigator}
        rides={this.thisHorsesRides()}
        riders={this.thisHorsesRiders()}
        uploadPhoto={this.uploadPhoto}
        user={this.props.user}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  return {
    horseUsers: mainState.get('horseUsers'),
    horses: mainState.get('horses'),
    horse: mainState.getIn(['horses', passedProps.horse.get('_id')]),
    rides: mainState.get('rides'),
    user: mainState.get('users').get(localState.get('userID')),
    users: mainState.get('users')
  }
}

export default connect(mapStateToProps)(HorseProfileContainer)
