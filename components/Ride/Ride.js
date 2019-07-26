import React, { PureComponent } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import memoizeOne from 'memoize-one'
import moment from 'moment'
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Dimensions,
  Platform,
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
import { brand, darkBrand, danger, darkGrey } from '../../colors'
import HorseCard from './HorseCard'
import {
  DEFAULT_HORSE_SPEEDS,
  haversine,
  logRender,
  logInfo,
  parseRideCoordinate,
  speedGradient,
} from '../../helpers'
import { userName } from '../../modelHelpers/user'
import PaceChart from '../RideCharts/PaceChart'
import PaceExplanationModal from './PaceExplanation'
import PhotoFilmstrip from './PhotoFilmstrip'
import RideComments from '../RideComments/RideComments'
import Stats from './Stats'
import Thumbnail from '../Images/Thumbnail'
import TimeoutManager from '../../services/TimeoutManager'
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
    this.showProfile = this.showProfile.bind(this)
    this.setPaceModalOpen = this.setPaceModalOpen.bind(this)

    this.memoizedMaxSpeed = memoizeOne(this.maxSpeed)
    this.memoizedParsePaceData = memoizeOne(this.parsePaceData)

    this.scrollTimeout = null
  }

  componentWillUnmount () {
    TimeoutManager.deleteTimeout(this.scrollTimeout)
  }

  componentDidUpdate (nextProps) {
    if (nextProps.skipToComments && !this.state.scrolled) {
      TimeoutManager.newTimeout(() => {
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

  getPaces (paceHorse) {
    const speedSource = paceHorse && paceHorse.get('gaitSpeeds') ? paceHorse.get('gaitSpeeds') : DEFAULT_HORSE_SPEEDS
    return {
      walk: speedSource.get('walk'),
      trot: speedSource.get('trot'),
      canter: speedSource.get('canter'),
      gallop: speedSource.get('gallop'),
    }
  }


  parsePaceData (rideCoordinates, paceHorse) {
    let lastPoint = null
    const paces = this.getPaces(paceHorse)
    const paceBuckets = [
      {x: 1, min: 0, max: paces.walk.get(1), distance: 0, time: 0, color: speedGradient(0), label: "Walk"},
      {x: 2, min: paces.trot.get(0), max: paces.trot.get(1), distance: 0, time: 0, color: speedGradient(paces.trot.get(0)), label: "Trot"},
      {x: 3, min: paces.canter.get(0), max: paces.canter.get(1), distance: 0, time: 0, color: speedGradient(paces.canter.get(0)), label: "Canter"},
      {x: 4, min: paces.gallop.get(0), max: 1000, distance: 0, time: 0, color: speedGradient(paces.gallop.get(0)), label: "Gallop"}
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
    const removes = []
    for (let i = 0; i < paceBuckets.length; i++) {
      const bucket = paceBuckets[i]
      if (bucket.distance === 0) {
        removes.push(i)
      }
    }
    for (let i = removes.length -1; i >= 0; i--) {
      paceBuckets.splice(removes[i], 1);
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
      Alert.alert(this.props.ride.get('_id'))
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
          <CardItem cardBody>
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
    let speedData = this.memoizedParsePaceData(this.props.rideCoordinates.get('rideCoordinates'), this.props.paceHorse)
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
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'always'}
        ref={(i) => this.scrollable = i}
        style={{flex: 1}}
      >
        <PaceExplanationModal
          modalOpen={this.state.paceExplanationOpen}
          closeModal={this.setPaceModalOpen(false)}
          paces={this.getPaces(this.props.paceHorse)}
          paceHorse={this.props.paceHorse}
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
            <View style={{flex: 1}}>
              <ViewingMap
                rideCoordinates={this.props.rideCoordinates.get('rideCoordinates')}
                ridePhotos={this.props.ridePhotos}
                showPhotoLightbox={this.props.showPhotoLightbox}
              />
              <View style={[{position: 'absolute', right: 10}, Platform.select({android: {bottom: 10}, ios: {top: 10}})]}>
                <TouchableOpacity onPress={this.fullscreenMap}>
                  <BuildImage source={require('../../img/fullscreen.png')} style={{width: 35, height: 35}} />
                </TouchableOpacity>
              </View>
            </View>
            { this.props.ride.get('containsPrivateProperty') ? (<View style={{backgroundColor: danger, marginBottom: 5, paddingTop: 3, paddingBottom: 3}}>
              <Text style={{textAlign: 'center'}}>This ride contains private land and should not be ridden without landowner permission.</Text>
            </View>) : null }
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
              toggleCarrot={this.props.toggleCarrot}
              users={this.props.users}
              userPhotos={this.props.userPhotos}
              userID={this.props.userID}
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
                  <View style={{flex: 5, justifyContent: 'center'}}>
                    <Text style={{color: darkBrand }}>Comments</Text>
                  </View>
                </View>
              </CardItem>
              <CardItem cardBody style={{ flex: 1}}>
                <RideComments
                  newComment={this.props.newComment}
                  rideComments={this.props.rideComments}
                  showProfile={this.props.showProfile}
                  submitComment={this.props.submitComment}
                  updateNewComment={this.props.updateNewComment}
                  users={this.props.users}
                  userPhotos={this.props.userPhotos}
                />
              </CardItem>
            </Card>
          </View>
        </View>
      </KeyboardAwareScrollView>
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
