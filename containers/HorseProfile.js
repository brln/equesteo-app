import React, { Component } from 'react'
import { connect } from 'react-redux';

import { updateHorse, uploadHorsePhoto } from '../actions'
import { UPDATE_HORSE } from '../screens'
import HorseProfile from '../components/HorseProfile/HorseProfile'
import NavigatorComponent from './NavigatorComponent'

class HorseProfileContainer extends NavigatorComponent {
  constructor (props) {
    super(props)
    this.state = {
      modalOpen: false
    }
    this.closeDeleteModal = this.closeDeleteModal.bind(this)
    this.deleteHorse = this.deleteHorse.bind(this)
    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent)
    this.thisHorsesRides = this.thisHorsesRides.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)
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
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'dropdown') {
        this.props.navigator.showContextualMenu(
          {
            rightButtons: [
              {
                title: 'Edit',
              },
              {
                title: 'Delete',
              }
            ],
            onButtonPressed: (index) => {
              if (index === 0) {
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
              } else if (index === 1) {
                this.setState({modalOpen: true})
              }
            }
          }
        );
      }
    }
  }

  deleteHorse () {
    this.props.dispatch(updateHorse(this.props.horse.set('deleted', true)))
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

  render() {
    console.log('rendering HorseProfileContainer')
    return (
      <HorseProfile
        closeDeleteModal={this.closeDeleteModal}
        deleteHorse={this.deleteHorse}
        horse={this.props.horse}
        modalOpen={this.state.modalOpen}
        navigator={this.props.navigator}
        rides={this.thisHorsesRides()}
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
    horse: mainState.getIn(['horses', passedProps.horse.get('_id')]),
    horseUser: passedProps.user,
    rides: mainState.get('rides'),
    user: mainState.get('users').get(localState.get('userID'))
  }
}

export default connect(mapStateToProps)(HorseProfileContainer)
