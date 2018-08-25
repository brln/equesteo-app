import React, { PureComponent } from 'react';
import {
  Card,
  CardItem,
  Fab,
} from 'native-base';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { brand, darkBrand } from '../../colors'
import Riders from './Riders'
import FabImage from '../FabImage'

const { height } = Dimensions.get('window')


export default class RidersCard extends PureComponent {
  constructor (props) {
    super(props)
  }

  render() {
    let fab
    if (this.props.riders.indexOf(this.props.user) < 0) {
      fab = (
        <Fab
          direction="up"
          style={{backgroundColor: brand}}
          position="bottomRight"
          onPress={this.props.addRider}>
          <FabImage source={require('../../img/addUser.png')} height={30} width={30}/>
        </Fab>
      )
    }
    return (
      <Card>
        <CardItem header style={{padding: 5}}>
          <View style={{paddingLeft: 5}}>
            <Text style={{color: darkBrand}}>Riders</Text>
          </View>
        </CardItem>
        <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20}}>
          <Riders
            riders={this.props.riders}
            showRiderProfile={this.props.showRiderProfile}
          />
        </CardItem>
        { fab }
      </Card>
    )
  }
}

const styles = StyleSheet.create({});
