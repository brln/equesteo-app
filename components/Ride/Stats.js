import moment from 'moment'
import React, { PureComponent } from 'react'
import { StyleSheet } from 'react-native'

import {
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Card,
  CardItem,
} from 'native-base'

import Stat from '../Stat'

export default class Stats extends PureComponent {
  constructor (props) {
    super(props)
    this.horseAvatar = this.horseAvatar.bind(this)
    this.horseProfileURL = this.horseProfileURL.bind(this)
    this.makeTimeRiding = this.makeTimeRiding.bind(this)
    this.makeStartTime = this.makeStartTime.bind(this)
    this.makeDistance = this.makeDistance.bind(this)
    this.makeAvgSpeed = this.makeAvgSpeed.bind(this)
    this.makeMaxSpeed = this.makeMaxSpeed.bind(this)
    this.whichHorse = this.whichHorse.bind(this)
  }

  horseProfileURL (horse) {
    if (horse) {
      const profilePhotoID = horse.get('profilePhotoID')
      if (horse && profilePhotoID &&
        this.props.horsePhotos.get(profilePhotoID)) {
        return this.props.horsePhotos.getIn([profilePhotoID, 'uri'])
      }
    }
  }

  horseAvatar (horse) {
    const horseProfileURL = this.horseProfileURL(horse)
    let source
    if (horseProfileURL) {
      source = { uri: horseProfileURL }
    } else {
      source = require('../../img/breed.png')
    }
    return source
  }

  whichHorse () {
    let found = null
    for (let horse of this.props.horses) {
      if (horse.get('_id') === this.props.ride.get('horseID')) {
        found = horse
        break
      }
    }
    return found
  }

  showHorseProfile (horse) {
    if (horse) {
      return () => {
        this.props.showHorseProfile(horse, this.props.rideHorseOwnerID)
      }
    } else {
      return () => {}
    }
  }

  makeTimeRiding () {
    return moment.utc(this.props.ride.get('elapsedTimeSecs') * 1000).format('HH:mm:ss')
  }

  makeStartTime () {
    return moment(this.props.ride.get('startTime')).format('h:mm a')
  }

  makeDistance () {
    return `${this.props.ride.get('distance').toFixed(2)} mi`
  }

  makeAvgSpeed () {
    return `${(
      this.props.ride.get('distance') / (this.props.ride.get('elapsedTimeSecs') / 3600)
    ).toFixed(1)} mph`
  }

  makeMaxSpeed () {
    return `${this.props.maxSpeed.toFixed(1)} mph`
  }

  render () {
    const horse = this.whichHorse()
    return (
      <Card style={{flex: 1}}>
        <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20, flex: 1}}>
          <View style={{flex: 1, paddingTop: 20}}>
            <View style={{flex: 1, flexDirection: 'row', paddingBottom: 10}}>
              <TouchableOpacity style={{flex: 1}} onPress={this.showHorseProfile(horse)}>
                <Stat
                  imgSrc={this.horseAvatar(horse)}
                  text={'Horse'}
                  value={ horse ? horse.get('name') : 'none'}
                />
              </TouchableOpacity>
              <Stat
                imgSrc={require('../../img/clock.png')}
                text={'Start Time'}
                value={this.makeStartTime()}
              />
            </View>
            <View style={{flex: 1, flexDirection: 'row', paddingBottom: 10}}>
              <Stat
                imgSrc={require('../../img/stopwatch.png')}
                text={'Total Time Riding'}
                value={this.makeTimeRiding()}
              />
              <Stat
                imgSrc={require('../../img/distance.png')}
                text={'Distance'}
                value={this.makeDistance()}
              />
            </View>
            <View style={{flex: 1, flexDirection: 'row', paddingBottom: 10}}>
              <Stat
                imgSrc={require('../../img/speedometer.png')}
                text={'Average Speed'}
                value={this.makeAvgSpeed()}
              />
              <Stat
                imgSrc={require('../../img/maxSpeed.png')}
                text={'Max Speed'}
                value={this.makeMaxSpeed()}
              />
            </View>
          </View>
        </CardItem>
      </Card>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statFont: {
    fontSize: 24
  },

});
