
import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import {
  Card,
} from 'native-base'

import RideHorse from './RideHorse'

export default class HorseCard extends PureComponent {
  constructor (props) {
    super(props)
    this.allRideHorses = this.allRideHorses.bind(this)
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

  allRideHorses () {
    const all = []
    this.props.rideHorses.valueSeq().sort((a, b) => a.timestamp - b.timestamp).forEach(rideHorse => {
      const horse = this.props.horses.get(rideHorse.get('horseID'))
      const ownerID = this.props.horseOwnerIDs.get(rideHorse.get('horseID'))
      all.push(
         <RideHorse
          key={rideHorse.get('_id')}
          imgSrc={this.horseAvatar(horse)}
          horse={horse}
          ownerID={ownerID}
          rideHorse={rideHorse}
          showHorseProfile={this.props.showHorseProfile}
        />
      )
    })
    return all
  }

  render () {
    if (this.props.ride.get('horseID') || this.props.rideHorses.keySeq().count() > 0) { // remove when everyone > version 4e
      return (
        <Card style={{flex: 1}}>
          <View style={styles.main}>
            { this.allRideHorses() }
          </View>
        </Card>
      )
    } else {
      return null
    }
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
