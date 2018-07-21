import React, { Component } from 'react'
import Swiper from 'react-native-swiper';
import memoizeOne from 'memoize-one';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { haversine } from '../../helpers'
import { MAP, RIDE_DETAILS } from '../../screens'
import PhotosByTimestamp from '../PhotosByTimestamp'
import SpeedChart from './SpeedChart'
import Stats from './Stats'
import DeleteModal from '../DeleteModal'

const { height, width } = Dimensions.get('window')

export default class Ride extends Component {
  constructor (props) {
    super(props)
    this.state = {
      modalOpen: false
    }
    this.closeDeleteModal = this.closeDeleteModal.bind(this)
    this.deleteRide = this.deleteRide.bind(this)
    this.fullscreenMap = this.fullscreenMap.bind(this)
    this.memoizedParse = memoizeOne(this.parseSpeedData)

    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  componentWillUnmount() {
    this.memoizedParse = memoizeOne(this.parseSpeedData)
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
                  screen: RIDE_DETAILS,
                  title: 'Update Ride',
                  passProps: {
                    rideID: this.props.ride._id
                  },
                  navigatorStyle: {},
                  navigatorButtons: {},
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

  parseSpeedData (rideCoordinates) {
    const parsedData = []
    let parsedBucket = []
    let lastPoint = null
    let fullDistance = 0
    let maxSpeed = 0

    const desiredNumCoords = 85
    const actualNumCoords = rideCoordinates.length
    const bucketSize = Math.ceil(actualNumCoords / desiredNumCoords)

    for (let rideCoord of rideCoordinates) {
      if (!lastPoint) {
        parsedBucket.push({distance: 0, pace: 0})
      } else {
        const distance = haversine(
          lastPoint.latitude,
          lastPoint.longitude,
          rideCoord.latitude,
          rideCoord.longitude
        )
        fullDistance += distance

        const timeDiff = (rideCoord.timestamp / 1000) - (lastPoint.timestamp / 1000)
        const mpSecond = distance / timeDiff
        const mph = mpSecond * 60 * 60
        parsedBucket.push({ pace: mph })

        if (mph > maxSpeed) {
          maxSpeed = mph
        }
      }
      lastPoint = rideCoord

      if (parsedBucket.length === bucketSize) {
        const pace = parsedBucket.reduce((acc, val) => acc + val.pace, 0) / bucketSize
        parsedData.push({ distance: fullDistance, pace })
        parsedBucket = []
      }
    }
    return {
      avgSpeed: parsedData,
      maxSpeed: maxSpeed
    }
  }

  fullscreenMap () {
    this.props.navigator.push({
      screen: MAP,
      title: 'Map',
      animationType: 'slide-up',
      passProps: {
        rideID: this.props.ride._id
      }
    })
  }

  closeDeleteModal () {
    this.setState({
      modalOpen: false
    })
  }

  deleteRide () {
    this.props.deleteRide()
    this.props.navigator.popToRoot()
  }

  render () {
    let speedChart = <Text>Not enough points for Speed Chart</Text>
    let speedData = this.memoizedParse(this.props.ride.rideCoordinates)
    if (this.props.ride.rideCoordinates.length > 2) {
      speedChart = (
        <View style={styles.slide}>
          <SpeedChart
            speedData={speedData.avgSpeed}
          />
        </View>
      )
    }
    return (
      <ScrollView style={{flex: 1}}>
        <DeleteModal
          modalOpen={this.state.modalOpen}
          closeDeleteModal={this.closeDeleteModal}
          deleteFunc={this.deleteRide}
          text={"Are you sure you want to delete this ride?"}
        />
        <View style={{flex: 1}}>
          <View style={{height: ((height / 2) - 20)}}>
            <Swiper
              loop={false}
            >
              <TouchableWithoutFeedback style={styles.slide}
                onPress={this.fullscreenMap}
              >
                <Image style={styles.image} source={{uri: this.props.ride.mapURL }} />
              </TouchableWithoutFeedback>
              { speedChart }
            </Swiper>
          </View>
          <View style={{flex: 1}}>
            <Stats
              ride={this.props.ride}
              horses={this.props.horses}
              maxSpeed={speedData.maxSpeed}
            />
            <PhotosByTimestamp
              photosByID={this.props.ride.photosByID}
              profilePhotoID={this.props.ride.profilePhotoID}
              changeProfilePhoto={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    width,
    flex: 1
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold'
  },
  image: {
    width,
    flex: 1
},
});
