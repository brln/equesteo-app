import { Map } from 'immutable'
import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'


import { stashRidePhoto } from '../actions/standard'
import Camera from '../components/Camera'
import { brand } from '../colors'
import { generateUUID, unixTimeNow } from '../helpers'
import { PHOTO_LIGHTBOX } from '../screens/main'
import { EqNavigation } from '../services'


class CameraContainer extends Component {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        elevation: 0,
        backButton: {
          color: 'white',
        }
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      showCam: true
    }
    this.onViewerClose = this.onViewerClose.bind(this)
    this.photoSources = this.photoSources.bind(this)
    this.showRecentPhoto = this.showRecentPhoto.bind(this)
    this.stashNewRidePhoto = this.stashNewRidePhoto.bind(this)
  }

  photoSources () {
    return this.props.currentRidePhotos.valueSeq().sort((a, b) => {
      return b.get('timestamp') - a.get('timestamp')
    }).reduce((a, rp) => {
      a.push({url: rp.get('uri')})
      return a
    }, [])
  }

  showRecentPhoto () {
    this.setState({
      showCam: false
    })
    EqNavigation.push(this.props.componentId, {
      component: {
        name: PHOTO_LIGHTBOX,
        passProps: {
          sources: this.photoSources(),
          onClose: this.onViewerClose
        }
      }
    }).catch(() => {})
  }

  onViewerClose () {
    this.setState({
      showCam: true
    })
  }

  stashNewRidePhoto(uri) {
    this.props.dispatch(
      stashRidePhoto(
        Map({
          _id: generateUUID(),
          uri,
          userID: this.props.userID,
          timestamp: unixTimeNow(),
          lat: this.props.lastLocation.get('latitude'),
          lng: this.props.lastLocation.get('longitude'),
          accuracy: this.props.lastLocation.get('accuracy'),
          type: 'ridePhoto',
        }),
        'currentRidePhotoStash'
      )
    )
  }

  mostRecentPhoto () {
    return this.props.currentRidePhotos.valueSeq().reduce((a, rp) => {
      if (!a || a.get('timestamp') < rp.get('timestamp')) {
        a = rp
      }
      return a
    }, null)
  }

  render() {
    return (
      <Camera
        mostRecentPhoto={this.mostRecentPhoto()}
        showCam={this.state.showCam}
        showRecentPhoto={this.showRecentPhoto}
        stashNewRidePhoto={this.stashNewRidePhoto}
      />
    );
  }
}

function mapStateToProps (state) {
  const localState = state.get('localState')
  const currentRideState = state.get('currentRide')
  const userID = localState.get('userID')
  return {
    userID,
    lastLocation: currentRideState.get('lastLocation'),
    currentRidePhotos: localState.getIn(['ridePhotoStash', 'currentRidePhotoStash']) || Map()
  }
}

export default connect(mapStateToProps)(CameraContainer)
