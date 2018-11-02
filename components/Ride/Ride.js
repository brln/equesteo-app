import React, { PureComponent } from 'react'
import Swiper from 'react-native-swiper';
import memoizeOne from 'memoize-one';
import moment from 'moment'
import {
  Clipboard,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Card,
  CardItem,
  Thumbnail
} from 'native-base'

import { darkBrand, darkGrey } from '../../colors'
import { haversine, logRender, logInfo, parseRideCoordinate, toElevationKey } from '../../helpers'
import PhotoFilmstrip from './PhotoFilmstrip'
import RideImage from '../Feed/RideImage'
import SpeedChart from './SpeedChart'
import Stats from './Stats'
import DeleteModal from '../Shared/DeleteModal'
import ElevationChart from './ElevationChart'

const { width } = Dimensions.get('window')

export default class Ride extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      titleTouchCount: 0
    }
    this.fullscreenMap = this.fullscreenMap.bind(this)
    this.userAvatar = this.userAvatar.bind(this)
    this.userName = this.userName.bind(this)
    this.rideNotes = this.rideNotes.bind(this)
    this.rideTime = this.rideTime.bind(this)
    this.maybeShowID = this.maybeShowID.bind(this)
    this.parseElevationData = this.parseElevationData.bind(this)
    this.showProfile = this.showProfile.bind(this)
    this.speedChart = this.speedChart.bind(this)

    this.memoizedParse = memoizeOne(this.parseSpeedData)
    this.memoizedMaxSpeed = memoizeOne(this.maxSpeed)
    this.memoizedParseElevation = memoizeOne(this.parseElevationData)
  }

  showProfile () {
    this.props.showProfile(this.props.rideUser)
  }

  parseElevationData (rideCoordinates, rideElevations) {
    let totalDistance = 0
    let totalGain = 0
    let lastPoint = null
    let points = []

    for (let rideCoord of rideCoordinates) {
      const parsedCoord = parseRideCoordinate(rideCoord)
      if (!lastPoint) {
        lastPoint = parsedCoord
      } else {
        totalDistance += haversine(
          lastPoint.latitude,
          lastPoint.longitude,
          parsedCoord.latitude,
          parsedCoord.longitude
        )
        const elevation = rideElevations.getIn([
          toElevationKey(parsedCoord.latitude),
          toElevationKey(parsedCoord.longitude)
        ])
        const lastElevation = rideElevations.getIn([
          toElevationKey(lastPoint.latitude),
          toElevationKey(lastPoint.longitude)
        ])
        const diff = Math.abs(lastElevation - elevation)
        const percentDiff = diff / elevation
        if (diff && percentDiff < 0.15) {
          const elevationChange = elevation - lastElevation
          totalGain += elevationChange > 0 ? elevationChange : 0
          points.push({
            elevation,
            distance: totalDistance,
            gain: totalGain
          })
        }
        lastPoint = parsedCoord
      }
    }
    return points
  }

  parseSpeedData (rideCoordinates) {
    const parsedData = []
    let parsedBucket = []
    let lastPoint = null
    let fullDistance = 0

    const desiredNumCoords = 300
    const actualNumCoords = rideCoordinates.count()
    const bucketSize = Math.ceil(actualNumCoords / desiredNumCoords)

    for (let rideCoord of rideCoordinates) {
      const parsedCoord = parseRideCoordinate(rideCoord)
      if (!lastPoint) {
        parsedBucket.push({distance: 0, pace: 0})
      } else {
        const distance = haversine(
          lastPoint.latitude,
          lastPoint.longitude,
          parsedCoord.latitude,
          parsedCoord.longitude
        )
        fullDistance += distance

        const timeDiff = (parsedCoord.timestamp / 1000) - (lastPoint.timestamp / 1000)
        if (timeDiff === 0) {
          continue
        }
        const mpSecond = distance / timeDiff
        const mph = mpSecond * 60 * 60
        parsedBucket.push({ pace: mph })
      }
      lastPoint = parsedCoord

      if (parsedBucket.length === bucketSize) {
        const pace = parsedBucket.reduce((acc, val) => acc + val.pace, 0) / bucketSize
        const paces = parsedBucket.map(val => val.pace)
        const max = Math.max(...paces)
        const min = Math.min(...paces)
        parsedData.push({ distance: fullDistance, pace, max, min })
        parsedBucket = []
      }
    }
    return parsedData
  }

  maxSpeed(rideCoordinates) {
    let bucketDistance = 0
    let bucketTime = 0
    let lastPoint = null
    let maxSpeed = 0

    const minDistance = (50 * 3) / 5280 // 50 yards
    for (let rideCoord of rideCoordinates) {
      const parsedCoord = parseRideCoordinate(rideCoord)
      if (!lastPoint) {
        lastPoint = parsedCoord
      } else {
        bucketDistance += haversine(
          lastPoint.latitude,
          lastPoint.longitude,
          parsedCoord.latitude,
          parsedCoord.longitude
        )

        bucketTime += (parsedCoord.timestamp / 1000) - (lastPoint.timestamp / 1000)

        if (bucketDistance > minDistance) {
          const bucketSpeed = bucketDistance / (bucketTime / 60 / 60)
          if (bucketSpeed > maxSpeed) {
            maxSpeed = bucketSpeed
          }
          bucketDistance = 0
          bucketTime = 0
        }
        lastPoint = parsedCoord
      }
    }
    return maxSpeed
  }

  fullscreenMap () {
    this.props.showFullscreenMap(this.props.ride.get('_id'))
  }

  // @TODO: these were copypasta from the ride card, factor out into component
  getUserProfilePhotoURL (user) {
    const profilePhotoID = user.get('profilePhotoID')
    let profilePhotoURL = null
    if (profilePhotoID) {
      profilePhotoURL = user.getIn(['photosByID', profilePhotoID, 'uri'])
    }
    return profilePhotoURL
  }

  userAvatar () {
    if (this.props.userID !== this.props.rideUser.get('_id')) {
      let source
      const userProfilePhotoURL = this.getUserProfilePhotoURL(this.props.rideUser)
      if (userProfilePhotoURL) {
        source = {uri: userProfilePhotoURL}
      } else {
        source = require('../../img/empty.png')
      }
      return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', marginRight: -20}}>
          <TouchableOpacity
            onPress={this.showProfile}
          >
            <Thumbnail
              small
              source={source}
            />
          </TouchableOpacity>
        </View>
      )
    } else {
      return null
    }
  }

  userName () {
    const firstName = this.props.rideUser.get('firstName')
    const lastName = this.props.rideUser.get('lastName')
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    } else if (firstName || lastName) {
      return firstName || lastName
    } else {
      return 'No Name'
    }
  }

  rideTime () {
    const t = this.props.ride.get('startTime')
    return `${moment(t).format('MMMM Do YYYY')} at ${moment(t).format('h:mm a')}`
  }
  // @TODO end

  rideNotes () {
    if (this.props.ride.get('notes')) {
      return (
        <Card>
          <CardItem header>
            <Text style={{color: darkBrand }}>Notes:</Text>
          </CardItem>
          <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
            <Text>{this.props.ride.get('notes')}</Text>
          </CardItem>
        </Card>
      )
    }
  }

  maybeShowID () {
    this.setState({
      titleTouchCount: this.state.titleTouchCount + 1
    })
    if (this.state.titleTouchCount === 5) {
      alert(this.props.ride.get('_id'))
      Clipboard.setString(this.props.ride.get('_id'))
      logInfo(this.props.ride.get('_id'))
      this.setState({
        titleTouchCount: 0
      })
    }
  }

  speedChart () {
    let speedChart = (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Not enough points for Speed Chart</Text>
      </View>
    )
    let speedData = this.memoizedParse(this.props.rideCoordinates.get('rideCoordinates'))
    if (speedData.length >= 2) {
      speedChart = (
        <View style={styles.slide}>
          <SpeedChart
            speedData={speedData}
          />
        </View>
      )
    }
    return speedChart
  }

  elevationProfile () {
    let elevationProfile = (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Not enough points for an Elevation Profile</Text>
      </View>
    )
    if (this.props.rideElevations) {
      let elevationData = this.memoizedParseElevation(
        this.props.rideCoordinates.get('rideCoordinates'),
        this.props.rideElevations.get('elevations')
      )
      if (elevationData.length >= 2) {
        elevationProfile = (
          <View style={styles.slide}>
            <ElevationChart
              elevationData={elevationData}
            />
          </View>
        )
      }
    }
    return elevationProfile
  }

  render () {
    logRender('Ride.Ride')
    let maxSpeed = this.memoizedMaxSpeed(this.props.rideCoordinates.get('rideCoordinates'))
    const height = (width * 9 / 16) + 54
    return (
      <ScrollView style={{flex: 1}}>
        <DeleteModal
          modalOpen={this.props.modalOpen}
          closeDeleteModal={this.props.closeDeleteModal}
          deleteFunc={this.props.deleteRide}
          text={"Are you sure you want to delete this ride?"}
        />

        <View style={{flex: 1, flexDirection: 'row', paddingTop: 10, paddingBottom: 10}}>
          { this.userAvatar() }
          <View style={{flex: 4, paddingLeft: 20, paddingRight: 20}}>
            <TouchableWithoutFeedback onPress={this.maybeShowID}>
              <View>
                <Text style={{fontSize: 20, color: 'black'}}>{this.props.ride.get('name') || 'No Name'}</Text>
                <Text style={{fontSize: 14}}>{this.userName()}</Text>
                <Text style={{fontSize: 12, fontWeight: 'normal', color: darkGrey}}>{this.rideTime()}</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>

        <View style={{flex: 1}}>
          <View style={{height}}>
            <Swiper
              loop={false}
            >
              <TouchableOpacity style={styles.slide}
                onPress={this.fullscreenMap}
              >
                <RideImage
                  style={styles.image}
                  uri={this.props.ride.get('mapURL') }
                />
              </TouchableOpacity>
              { this.speedChart() }
              { this.elevationProfile() }
            </Swiper>
          </View>

          <PhotoFilmstrip
            photosByID={this.props.ride.get('photosByID')}
            showPhotoLightbox={this.props.showPhotoLightbox}
            exclude={[]}
          />

          <View style={{flex: 1}}>
            <Stats
              horses={this.props.horses}
              maxSpeed={maxSpeed}
              ride={this.props.ride}
              rideHorseOwnerID={this.props.rideHorseOwnerID}
              rideUser={this.props.rideUser}
              showHorseProfile={this.props.showHorseProfile}
              userID={this.props.userID}
            />
            { this.rideNotes() }
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
