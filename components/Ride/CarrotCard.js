import React, { PureComponent } from 'react'
import {
  Dimensions,
  Text,
  View,
} from 'react-native';
import {
  Card,
  CardItem,
} from 'native-base'

import BuildImage from '../Images/BuildImage'
import CarrotList from './CarrotList'
import { brand, darkBrand, darkGrey } from '../../colors'

const { width } = Dimensions.get('window')
const iconWidth = width / 15

export default class CarrotCard extends PureComponent {
  constructor (props) {
    super(props)
    this.carrots = this.carrots.bind(this)
  }

  carrots () {
    const carrotUsers = this.props.rideCarrots.map(rc => {
      return this.props.users.get(rc.get('userID'))
    })
    return (
      <CarrotList
        showProfile={this.props.showProfile}
        users={carrotUsers}
        userPhotos={this.props.userPhotos}
      />
    )
  }

  render () {
    if (this.props.rideCarrots.count() > 0) {
      return (
        <Card style={{flex: 1}}>
          <CardItem header style={{padding: 5}}>
            <View style={{paddingLeft: 5, flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 1}}>
                <BuildImage
                  source={require('../../img/carrot.png')}
                  style={{flex: 1, height: iconWidth, width: iconWidth, resizeMode: 'contain'}}
                />
              </View>
              <View style={{flex: 5}}>
                <Text style={{color: darkBrand }}>Carrots</Text>
              </View>
            </View>
          </CardItem>
          <CardItem cardBody style={{ flex: 1 }}>
            { this.carrots() }
          </CardItem>
        </Card>
      )
    } else {
      return null
    }
  }
}

