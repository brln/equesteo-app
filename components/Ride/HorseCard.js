import React, { PureComponent } from 'react'
import {
  Card,
  CardItem,
} from 'native-base'

import Stat from '../Stat'

export default class HorseCard extends PureComponent {
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

  render () {
    if (this.props.ride.get('horseID')) {
      const horse = this.whichHorse()
      return (
        <Card style={{flex: 1}}>
          <CardItem cardBody style={{ flex: 1, paddingBottom: 20, paddingTop: 20}}>
            <Stat
              imgSrc={this.horseAvatar(horse)}
              text={'Ridden'}
              value={ horse ? horse.get('name') : 'none'}
            />
          </CardItem>
        </Card>
      )
    } else {
      return null
    }
  }
}