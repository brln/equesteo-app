import React, { PureComponent } from 'react'
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

import { haversine, logRender } from '../../helpers'
import { MAP, RIDE_DETAILS } from '../../screens'
import PhotoFilmstrip from './PhotoFilmstrip'
import SpeedChart from './SpeedChart'
import Stats from './Stats'
import DeleteModal from '../DeleteModal'

const { width } = Dimensions.get('window')

export default class Ride extends PureComponent {
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
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'edit') {
        this.props.navigator.dismissAllModals()
        this.props.navigator.push({
          screen: RIDE_DETAILS,
          title: 'Update Ride',
          passProps: {
            rideID: this.props.ride.get('_id')
          },
          navigatorStyle: {},
          navigatorButtons: {},
          animationType: 'slide-up',
        });
      } else if (event.id === 'delete') {
        this.setState({modalOpen: true})
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
        if (timeDiff === 0) {
          continue
        }
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
        rideID: this.props.ride.get('_id')
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
    logRender('Ride.Ride')
    let speedChart = <Text>Not enough points for Speed Chart</Text>
    let speedData = this.memoizedParse(this.props.ride.get('rideCoordinates').toJS())
    if (speedData.avgSpeed.length >= 2) {
      speedChart = (
        <View style={styles.slide}>
          <SpeedChart
            speedData={speedData.avgSpeed}
          />
        </View>
      )
    }
    const height = (width * 9 / 16) + 20
    return (
      <ScrollView style={{flex: 1}}>
        <DeleteModal
          modalOpen={this.state.modalOpen}
          closeDeleteModal={this.closeDeleteModal}
          deleteFunc={this.deleteRide}
          text={"Are you sure you want to delete this ride?"}
        />
        <View style={{flex: 1}}>
          <View style={{height}}>
            <Swiper
              loop={false}
            >
              <TouchableWithoutFeedback style={styles.slide}
                onPress={this.fullscreenMap}
              >
                <Image style={styles.image} source={{uri: this.props.ride.get('mapURL') }} />
              </TouchableWithoutFeedback>
              { speedChart }
            </Swiper>
          </View>
          <View style={{flex: 1}}>
            <Stats
              ride={this.props.ride}
              horses={this.props.horses}
              maxSpeed={speedData.maxSpeed}
              navigator={this.props.navigator}
              rideUser={this.props.rideUser}
              userID={this.props.userID}
            />
            <PhotoFilmstrip
              photosByID={this.props.ride.get('photosByID')}
              navigator={this.props.navigator}
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
