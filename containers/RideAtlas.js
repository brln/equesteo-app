import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';

import { brand } from '../colors'
import { logRender } from '../helpers'
import RideAtlas from '../components/RideAtlas/RideAtlas'
import { deleteRideAtlasEntry } from "../actions/functional"
import {setActiveAtlasEntry} from "../actions/standard"

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
        leftButtons: [
          {
            id: 'back',
            icon: require('../img/back-arrow.png'),
            color: 'white'
          }
        ],
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
    this.deleteRideAtlasEntry = this.deleteRideAtlasEntry.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.setActiveAtlasEntry = this.setActiveAtlasEntry.bind(this)
    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'back') {
      Navigation.pop(this.props.componentId)
      if (this.props.onClose) {
        this.props.onClose()
      }
    }
  }

  setActiveAtlasEntry (id) {
    return () => {
      this.props.dispatch(setActiveAtlasEntry(id))
      Navigation.pop(this.props.componentId)
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