import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';

import { brand } from '../colors'
import ViewingMap from '../components/Ride/ViewingMap'
import { logRender } from '../helpers'
import { PHOTO_LIGHTBOX } from '../screens/main'
import { EqNavigation } from '../services'

class MapContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        backButton: {
          color: 'white'
        },
        elevation: 0
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
    this.showPhotoLightbox = this.showPhotoLightbox.bind(this)
  }

  showPhotoLightbox (sources) {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: PHOTO_LIGHTBOX,
        passProps: {
          sources
        }
      },
    }).catch(() => {})
  }

  thisRidesPhotos (ridePhotos) {
    return ridePhotos.filter((rp) => {
      return rp.get('rideID') === this.props.ride.get('_id') && rp.get('deleted') !== true
    })
  }

  render() {
    logRender('MapContainer')
    return (
      <ViewingMap
        rideCoordinates={this.props.rideCoordinates}
        ridePhotos={this.thisRidesPhotos(this.props.ridePhotos)}
        showPhotoLightbox={this.showPhotoLightbox}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const rideCoordinates = state.getIn([
    'pouchRecords',
    'selectedRideCoordinates',
    'rideCoordinates'
  ])
  return {
    ride: state.getIn(['pouchRecords', 'rides', passedProps.rideID]),
    ridePhotos: state.getIn(['pouchRecords', 'ridePhotos']),
    rideCoordinates,
  }
}

export default  connect(mapStateToProps)(MapContainer)
