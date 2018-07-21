import React, { Component } from 'react'
import { connect } from 'react-redux';

import { updateHorse, uploadHorsePhoto } from '../actions'
import { UPDATE_HORSE } from '../screens'
import HorseProfile from '../components/HorseProfile'
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
                    horseID: this.props.horse._id,
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
    this.props.dispatch(updateHorse({...this.props.horse, deleted: true}))
    this.props.navigator.pop()
  }

  uploadPhoto (location) {
    this.props.dispatch(uploadHorsePhoto(location, this.props.horse._id))
  }

  render() {
    return (
      <HorseProfile
        closeDeleteModal={this.closeDeleteModal}
        deleteHorse={this.deleteHorse}
        horse={this.props.horse}
        modalOpen={this.state.modalOpen}
        navigator={this.props.navigator}
        uploadPhoto={this.uploadPhoto}
        user={this.props.user}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  return {
    horse: state.horses.filter((h) => h._id === passedProps.horse._id)[0],
    horseUser: passedProps.user,
    user: state.users[state.localState.userID]
  }
}

export default connect(mapStateToProps)(HorseProfileContainer)
