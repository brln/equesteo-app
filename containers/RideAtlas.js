import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';

import { brand } from '../colors'
import { logRender } from '../helpers'
import RideAtlas from '../components/RideAtlas/RideAtlas'
import { deleteRideAtlasEntry } from "../actions/functional"
import {setActiveAtlasEntry} from "../actions/standard"
import { EqNavigation } from '../services'
import Amplitude, { CHOOSE_RIDE_ATLAS_RIDE } from "../services/Amplitude"

class RideAtlasContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "Ride Atlas",
          color: 'white',
          fontSize: 20
        },
        background: {
          color: brand,
        },
        elevation: 0,
        backButton: {
          color: 'white'
        }
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
    this.deleteRideAtlasEntry = this.deleteRideAtlasEntry.bind(this)
    this.setActiveAtlasEntry = this.setActiveAtlasEntry.bind(this)
    Navigation.events().bindComponent(this);
  }

  setActiveAtlasEntry (id) {
    return () => {
      Amplitude.logEvent(CHOOSE_RIDE_ATLAS_RIDE)
      this.props.dispatch(setActiveAtlasEntry(id))
      EqNavigation.pop(this.props.componentId).catch(() => {})
    }
  }

  deleteRideAtlasEntry (id) {
    return () => {
      this.props.dispatch(deleteRideAtlasEntry(id))
    }
  }

  rideAtlasEntries () {
    return this.props.rideAtlasEntries.valueSeq().filter(rae => {
      return rae.get('deleted') !== true
    }).toJSON()
  }

  render() {
    logRender('RideAtlas')
    return (
      <RideAtlas
        deleteRideAtlasEntry={this.deleteRideAtlasEntry}
        rideAtlasEntries={this.rideAtlasEntries()} // @TODO MEMOIZE ME
        setActiveAtlasEntry={this.setActiveAtlasEntry}
      />
    )
  }
}

function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  return {
    rideAtlasEntries: pouchState.get('rideAtlasEntries')
  }
}

export default  connect(mapStateToProps)(RideAtlasContainer)
