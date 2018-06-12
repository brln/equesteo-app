import React, { Component } from 'react'
import Modal from 'react-native-modalbox';
import { Navigation } from 'react-native-navigation'
import moment from 'moment'

import { staticMap } from '../helpers'

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MAP } from '../screens'
import { background } from '../colors'
import PhotosByTimestamp from './PhotosByTimestamp'

export default class Ride extends Component {
  constructor (props) {
    super(props)
    this.state = {
      modalOpen: false
    }
    this.fullscreenMap = this.fullscreenMap.bind(this)
    this.whichHorse = this.whichHorse.bind(this)

    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
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
                alert('edit')
              } else if (index === 1) {
                this.setState({modalOpen: true})
                // this.props.deleteRide(this.props.ride)
              }
            }
          }
        );
      }
    }
  }

  whichHorse () {
    let found = null
    for (let horse of this.props.horses) {
      if (horse._id === this.props.ride.horseID) {
        found = horse
      }
    }
    return found ? found.name : 'none'
  }

  fullscreenMap () {
    Navigation.showModal({
      screen: MAP,
      title: 'Map',
      animationType: 'slide-up',
      passProps: {
        rideCoords: this.props.ride.rideCoordinates
      }
    })
  }

  render() {
    return (
      <ScrollView>
        <Modal style={[styles.modal, styles.modal3]} position={"top"} ref={"modal3"} isDisabled={false} isOpen={this.state.modalOpen}>
          <Text style={styles.text}>Modal centered</Text>
        </Modal>
        <View style={styles.container}>
          <View style={{flex: 3}}>
            <TouchableOpacity
              onPress={this.fullscreenMap}
            >
              <Image
                source={{uri: staticMap(this.props.ride)}}
                style={{height: 250, width: null, flex: 1}}
              />
            </TouchableOpacity>
          </View>
          <View style={{flex: 1, padding: 5}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flex: 1}}>
                <Text>Horse:</Text>
                <Text style={styles.statFont}>{this.whichHorse()}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text>Start Time:</Text>
                <Text style={styles.statFont}>{moment(this.props.ride.startTime).format('h:mm a')}</Text>
              </View>
            </View>

            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flex: 1}}>
                <Text>Total Time Riding:</Text>
                <Text style={styles.statFont}>{ moment.utc(this.props.ride.elapsedTimeSecs * 1000).format('HH:mm:ss') }</Text>
              </View>

              <View style={{flex: 1}}>
                <Text>Distance:</Text>
                <Text style={styles.statFont}>{ this.props.ride.distance.toFixed(2) } mi</Text>
              </View>
            </View>
          </View>
          <View>
            <PhotosByTimestamp
              photosByID={this.props.ride.photosByID}
              profilePhotoID={this.props.ride.profilePhotoID}
            />
          </View>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background,
  },
  statFont: {
    fontSize: 24
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal3: {
    marginTop: 30,
    height: 300,
    width: 300
  },
});
