import React, { PureComponent } from 'react'
import {
  Button,
  Card,
  CardItem,
  Left,
  Right,
  Text,
} from 'native-base'
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import moment from 'moment'

import BuildImage from '../../Images/BuildImage'
import HorseThumbnails from '../../Shared/HorseThumbnails'
import Swiper from "./Swiper"
import UserAvatar from './UserAvatar'
import { brand, darkGrey } from '../../../colors'
import { userName } from '../../../modelHelpers/user'


export default class RideCard extends PureComponent {
  constructor (props) {
    super(props)
    this.avgSpeed = this.avgSpeed.bind(this)
    this.rideTime = this.rideTime.bind(this)
    this.showRide = this.showRide.bind(this)
    this.showProfile = this.showProfile.bind(this)
    this.toggleCarrot = this.toggleCarrot.bind(this)
    this.userName = this.userName.bind(this)
  }

  toggleCarrot () {
    this.props.toggleCarrot(this.props.ride.get('_id'))
  }

  showRide (skipToComments) {
    return () => {
      this.props.showRide(this.props.ride, skipToComments)
    }
  }

  showProfile () {
    this.props.showProfile(this.props.rideUser)
  }

  userName () {
    let name = null
    if (this.props.rideUser.get('_id') !== this.props.userID || !this.props.ownRideList) {
      name = userName(this.props.rideUser)
    }
    return name
  }

  rideTime () {
    const t = this.props.ride.get('startTime')
    return `${moment(t).format('MMMM Do YYYY')} at ${moment(t).format('h:mm a')}`
  }

  avgSpeed () {
    if (this.props.ride.get('distance') && this.props.ride.get('elapsedTimeSecs')) {
      return `${(
        this.props.ride.get('distance') / (this.props.ride.get('elapsedTimeSecs') / 3600)
      ).toFixed(1)} mph`
    } else {
      return '0 mph'
    }
  }

  render() {
    return (
      <Card>
        <CardItem header>
          <View style={{flex: 1}}>
            <TouchableOpacity style={styles.cardHeaderTouch} onPress={this.showProfile}>
              <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 10}}>
                <UserAvatar
                  ownRideList={this.props.ownRideList}
                  rideUser={this.props.rideUser}
                  userProfilePhotoURL={this.props.userProfilePhotoURL}
                  userID={this.props.userID}
                />
                <View>
                  <Text style={{fontSize: 14}}>{this.userName()}</Text>
                  <Text style={{fontSize: 12, fontWeight: 'normal', color: darkGrey}}>{this.rideTime()}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.showRide(false)}>
              <View style={{flex: 1, paddingTop: 15, paddingBottom: 15}}>
                <Text style={{fontSize: 20}}>{this.props.ride.get('name') || 'No Name'}</Text>
              </View>
            </TouchableOpacity>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flex: 5, flexDirection: 'row'}}>
                <View style={{paddingRight: 10, borderRightWidth: 1, borderRightColor: darkGrey}}>
                  <Text style={{color: darkGrey, fontSize: 12, fontWeight: 'normal'}}>
                    Distance
                  </Text>
                  <Text style={{fontSize: 20, fontWeight: 'normal', color: darkGrey}}>
                    {`${this.props.ride.get('distance').toFixed(1)} mi`}
                  </Text>
                </View>
                <View style={{paddingLeft: 10}}>
                  <Text style={{color: darkGrey, fontSize: 12, fontWeight: 'normal'}}>
                    Avg. Speed
                  </Text>
                  <Text style={{fontSize: 20, fontWeight: 'normal', color: darkGrey}}>
                    {this.avgSpeed()}
                  </Text>
                </View>
              </View>
              <View style={{flex: 3}}>
                <HorseThumbnails
                  horses={this.props.horses}
                  horseOwnerIDs={this.props.horseOwnerIDs}
                  horsePhotos={this.props.horsePhotos}
                  showHorseProfile={this.props.showHorseProfile}
                />
              </View>
            </View>
          </View>
        </CardItem>
        <CardItem cardBody>
          <Swiper
            logInfo={this.props.logInfo}
            ride={this.props.ride}
            ridePhotos={this.props.ridePhotos}
            showRide={this.showRide}
          />
        </CardItem>
        <CardItem footer>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity style={{flex: 1, flexDirection: 'row', paddingLeft: 20}} onPress={this.toggleCarrot}>
              <View style={{flex: 1}}>
                <BuildImage
                  source={require('../../../img/carrot.png')}
                  style={{height: 20, width: 20}}
                />
              </View>
              <View style={{flex: 5, flexDirection: 'row' }}>
                <Text style={{color: brand, fontWeight: 'normal'}}>{this.props.rideCarrots.count()} carrots</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{flex: 1, flexDirection: 'row'}} onPress={this.showRide(true)}>
              <View style={{flex: 1}}>
                <BuildImage
                  source={require('../../../img/comment.png')}
                  style={{height: 20, width: 20}}
                />
              </View>
              <View style={{flex: 4, flexDirection: 'row' }}>
                <Text style={{color: brand, fontWeight: 'normal'}}>{this.props.rideComments.count()} comments</Text>
              </View>
            </TouchableOpacity>
          </View>
        </CardItem>
      </Card>
    )
  }
}

const styles = StyleSheet.create({
  rideTitle: {
    fontSize: 24
  },
  cardHeaderTouch: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});

