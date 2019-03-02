import React, { PureComponent } from 'react'
import memoizeOne from 'memoize-one';
import moment from 'moment'
import {
  ActivityIndicator,
  Clipboard,
  Dimensions,
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Card,
  CardItem,
} from 'native-base'

import BuildImage from '../Images/BuildImage'
import Button from '../Button'
import CarrotCard from './CarrotCard'
import { brand, darkBrand, darkGrey } from '../../colors'
import HorseCard from './HorseCard'
import {
  haversine,
  logRender,
  logInfo,
  parseRideCoordinate,
  speedGradient,
} from '../../helpers'
import { userName } from '../../modelHelpers/user'
import DeleteModal from '../Shared/DeleteModal'
import PaceChart from '../RideCharts/PaceChart'
import PaceExplanationModal from './PaceExplanation'
import PhotoFilmstrip from './PhotoFilmstrip'
import RideComments from '../RideComments/RideComments'
import Stats from './Stats'
import Thumbnail from '../Images/Thumbnail'
import ViewingMap from './ViewingMap'

const { width } = Dimensions.get('window')
const iconWidth = width / 15

export default class Ride extends PureComponent {
  constructor (props) {
    super(props)
    this.scrollable = null
    this.scrollTimeout = null
    this.state = {
      titleTouchCount: 0,
      scrolled: false,
      paceExplanationOpen: false
    }

    this._renderRide = this._renderRide.bind(this)
    this._renderLoading = this._renderLoading.bind(this)
    this.fullscreenMap = this.fullscreenMap.bind(this)
    this.userAvatar = this.userAvatar.bind(this)
    this.rideNotes = this.rideNotes.bind(this)
    this.rideTime = this.rideTime.bind(this)
    this.maybeShowID = this.maybeShowID.bind(this)
    this.shareIcon = this.shareIcon.bind(this)
    this.showProfile = this.showProfile.bind(this)
    this.setPaceModalOpen = this.setPaceModalOpen.bind(this)

    this.memoizedMaxSpeed = memoizeOne(this.maxSpeed)
    this.memoizedParsePaceData = memoizeOne(this.parsePaceData)
  }

  componentDidMount () {
    Keyboard.addListener('keyboardDidShow', () => {
      this.scrollTimeout = setTimeout(() => {
        if (this.scrollable) {
          this.scrollable.scrollToEnd({animated: false})
        }
      }, 300)
    })
  }

  componentWillUnmount () {
    clearTimeout(this.scrollTimeout)
    Keyboard.removeAllListeners('keyboardDidShow')
  }

  componentDidUpdate (nextProps) {
    if (this.props.rideComments !== nextProps.rideComments || (nextProps.skipToComments && !this.state.scrolled)) {
      setTimeout(() => {
        if (this.scrollable) {
          this.scrollable.scrollToEnd({animated: true})
          this.setState({
            scrolled: true
          })
        }
      }, 300)
    }
  }

  showProfile () {
    this.props.showProfile(this.props.rideUser)
  }

  maxSpeed(rideCoordinates) {
    let bucketDistance = 0
    let bucketTime = 0
    let lastPoint = null
    let maxSpeed = 0

    const minDistance = (100 * 3) / 5280 // 100 yards
    for (let rideCoord of rideCoordinates) {
      const parsedCoord = parseRideCoordinate(rideCoord)
      if (!lastPoint) {
        lastPoint = parsedCoord
      } else {
        bucketDistance += haversine(
          lastPoint.get('latitude'),
          lastPoint.get('longitude'),
          parsedCoord.get('latitude'),
          parsedCoord.get('longitude')
        )

        bucketTime += (parsedCoord.get('timestamp') / 1000) - (lastPoint.get('timestamp') / 1000)

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

  setPaceModalOpen(val) {
    return () => {
      this.setState({
        paceExplanationOpen: val
      })
    }
  }


  parsePaceData (rideCoordinates) {
    let lastPoint = null
    const paceBuckets = [
      {x: 1, min: 0, max: 4, distance: 0, time: 0, color: speedGradient(0), label: "Walk"},
      {x: 2, min: 4, max: 8, distance: 0, time: 0, color: speedGradient(3), label: "Trot"},
      {x: 3, min: 8, max: 15, distance: 0, time: 0, color: speedGradient(5), label: "Canter"},
      {x: 4, min: 15, max: 1000, distance: 0, time: 0, color: speedGradient(10), label: "Gallop"}
    ]

    for (let rideCoord of rideCoordinates) {
      const parsedCoord = parseRideCoordinate(rideCoord)
      if (lastPoint) {
        const distance = haversine(
          lastPoint.get('latitude'),
          lastPoint.get('longitude'),
          parsedCoord.get('latitude'),
          parsedCoord.get('longitude')
        )
        const timeDiff = (parsedCoord.get('timestamp') / 1000) - (lastPoint.get('timestamp') / 1000)
        if (timeDiff === 0) {
          continue
        }
        const mpSecond = distance / timeDiff
        const mph = mpSecond * 60 * 60

        for (let paceBucket of paceBuckets) {
          if (mph > paceBucket.min && mph < paceBucket.max) {
            paceBucket.distance += distance
            paceBucket.time += timeDiff
          }
        }

      }
      lastPoint = parsedCoord
    }
    return paceBuckets
  }

  fullscreenMap () {
    this.props.showFullscreenMap(this.props.ride.get('_id'))
  }

  // @TODO: these were copypasta from the ride card, factor out into component
  getUserProfilePhotoURL (user) {
    const profilePhotoID = user.get('profilePhotoID')
    let profilePhotoURL = null
    if (profilePhotoID) {
      profilePhotoURL = this.props.userPhotos.getIn([profilePhotoID, 'uri'])
    }
    return profilePhotoURL
  }

  userAvatar () {
    let avatar
    if (this.props.userID !== this.props.rideUser.get('_id')) {
      const userProfilePhotoURL = this.getUserProfilePhotoURL(this.props.rideUser)
      avatar = (
        <View style={{paddingLeft: 10, paddingRight: 5}}>
          <Thumbnail
            source={{uri: userProfilePhotoURL}}
            emptySource={require('../../img/empty.png')}
            empty={!userProfilePhotoURL}
            height={width / 6}
            width={width / 6}
            round={true}
            onPress={this.showProfile}
          />
        </View>
      )
    }
    return avatar
  }

  shareIcon () {
    let icon
    if (this.props.userID === this.props.rideUser.get('_id') &&
      this.props.rideCoordinates.get('rideCoordinates').count() > 1) {
      icon = (
        <View style={{flex: 1}}>
          <TouchableOpacity onPress={this.props.shareRide}>
            <BuildImage
              source={require('../../img/androidShare.png')}
              style={{width: 40, height: 40}}
            />
          </TouchableOpacity>
        </View>
      )
    }
    return icon
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

  paceChart () {
    let container = function (child) {
      return (
        <Card>
          <CardItem header>
            <View style={{position: 'absolute', right: 10, top: 10}}>
              <TouchableOpacity onPress={this.setPaceModalOpen(true)}>
                <BuildImage
                  source={require('../../img/info.png')}
                  style={{height: 30, width: 30}}
                />
              </TouchableOpacity>
            </View>
            <Text style={{fontSize: 20}}>Pace</Text>
          </CardItem>
          <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>

            { child }
          </CardItem>
        </Card>
      )
    }.bind(this)
    let paceChart = (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300}}>
        <Text>Not enough data for pace chart.</Text>
      </View>
    )
    let speedData = this.memoizedParsePaceData(this.props.rideCoordinates.get('rideCoordinates'))
    if (this.props.rideCoordinates.get('rideCoordinates').count() >= 5) {
      paceChart = (
        <PaceChart
          speedData={speedData}
        />
      )
      return container(paceChart)
    } else {
      return null
    }
  }

  _renderLoading () {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={darkBrand} />
        <Text style={{textAlign: 'center', color: darkBrand}}>Loading Ride...</Text>
      </View>
    )
  }

  _renderRide () {
    logRender('Ride.Ride')
    let maxSpeed = this.memoizedMaxSpeed(this.props.rideCoordinates.get('rideCoordinates'))
    let elevationGain = this.props.rideElevations ? this.props.rideElevations.get('elevationGain') : 0
    const height = (width * 9 / 16) + 54
    return (
      <ScrollView
        keyboardShouldPersistTaps={'always'}
        ref={(i) => this.scrollable = i}
        style={{flex: 1}}
      >
        <PaceExplanationModal
          modalOpen={this.state.paceExplanationOpen}
          closeModal={this.setPaceModalOpen(false)}
        />
        <DeleteModal
          modalOpen={this.props.modalOpen}
          closeDeleteModal={this.props.closeDeleteModal}
          deleteFunc={this.props.deleteRide}
          text={"Are you sure you want to delete this ride?"}
        />
        <View style={{flex: 1, flexDirection: 'row', paddingTop: 10, paddingBottom: 10}}>
          { this.userAvatar() }
          <View style={{flex: 4, paddingLeft: 10, paddingRight: 20}}>
            <TouchableWithoutFeedback onPress={this.maybeShowID}>
              <View>
                <View style={{flex: 1, flexDirection: 'row', alignContent: 'space-between'}}>
                  <View style={{flex: 8}}>
                    <Text style={{fontSize: 24, color: 'black'}}>{this.props.ride.get('name') || 'No Name'}</Text>
                  </View>
                  {this.shareIcon()}
                </View>
                <TouchableOpacity onPress={this.showProfile}>
                  <Text style={{fontSize: 14}}>{ userName(this.props.rideUser) }</Text>
                </TouchableOpacity>
                <Text style={{fontSize: 12, fontWeight: 'normal', color: darkGrey}}>{this.rideTime()}</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>

        <View style={{flex: 1}}>
          <View style={{height}}>
            <ViewingMap
              rideCoordinates={this.props.rideCoordinates.get('rideCoordinates')}
              ridePhotos={this.props.ridePhotos}
              showPhotoLightbox={this.props.showPhotoLightbox}
            />
            <View style={{position: 'absolute', right: 10, bottom: 10}}>
              <TouchableOpacity onPress={this.fullscreenMap}>
                <BuildImage source={require('../../img/fullscreen.png')} style={{width: 35, height: 35}} />
              </TouchableOpacity>
            </View>
          </View>

          <PhotoFilmstrip
            photosByID={this.props.ridePhotos}
            showPhotoLightbox={this.props.showPhotoLightbox}
            exclude={[]}
          />

          <HorseCard
            horses={this.props.horses}
            horseOwnerIDs={this.props.horseOwnerIDs}
            horsePhotos={this.props.horsePhotos}
            ride={this.props.ride}
            rideHorses={this.props.rideHorses}
            showHorseProfile={this.props.showHorseProfile}
            userID={this.props.userID}
          />

          <View style={{flex: 1}}>
            <Card style={{flex: 1}}>
              <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20, flex: 1}}>
                <View style={{flex: 1}}>
                  <Stats
                    elevationGain={elevationGain}
                    horsePhotos={this.props.horsePhotos}
                    maxSpeed={maxSpeed}
                    ride={this.props.ride}
                    rideUser={this.props.rideUser}
                    showHorseProfile={this.props.showHorseProfile}
                    userID={this.props.userID}
                  />
                  <View style={{marginLeft: 50, marginRight: 50}}>
                  <Button text={"View Ride Charts"} color={brand} onPress={this.props.viewRideCharts}/>
                  </View>
                </View>
              </CardItem>
            </Card>

            { this.rideNotes() }

            { this.paceChart() }

            <CarrotCard
              rideCarrots={this.props.rideCarrots}
              showProfile={this.props.showProfile}
              users={this.props.users}
              userPhotos={this.props.userPhotos}
            />

            <Card style={{flex: 1}}>
              <CardItem header style={{padding: 5}}>
                <View style={{flex: 1, paddingLeft: 5, flexDirection: 'row'}}>
                  <View style={{flex: 1}}>
                    <BuildImage
                      source={require('../../img/comment.png')}
                      style={{flex: 1, height: iconWidth, width: iconWidth, resizeMode: 'contain'}}
                    />
                  </View>
                  <View style={{flex: 5}}>
                    <Text style={{color: darkBrand }}>Comments</Text>
                  </View>
                </View>
              </CardItem>
              <CardItem cardBody style={{ flex: 1}}>
                <RideComments
                  newComment={this.props.newComment}
                  rideComments={this.props.rideComments}
                  submitComment={this.props.submitComment}
                  updateNewComment={this.props.updateNewComment}
                  users={this.props.users}
                  userPhotos={this.props.userPhotos}
                />
              </CardItem>
            </Card>
          </View>
        </View>
      </ScrollView>
    )
  }

  render () {
    if (this.props.rideCoordinates) {
      return this._renderRide()
    } else {
      return this._renderLoading()
    }
  }
}
