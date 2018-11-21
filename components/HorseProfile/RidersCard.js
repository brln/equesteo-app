import React, { PureComponent } from 'react';
import {
  Card,
  CardItem,
} from 'native-base';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { darkBrand } from '../../colors'
import Riders from './Riders'

export default class RidersCard extends PureComponent {
  constructor (props) {
    super(props)
  }

  render() {
    return (
      <Card>
        <CardItem header style={{padding: 5}}>
          <View style={{paddingLeft: 5}}>
            <Text style={{color: darkBrand}}>Riders</Text>
          </View>
        </CardItem>
        <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20}}>
          <Riders
            addRider={this.props.addRider}
            deleteHorse={this.props.deleteHorse}
            riders={this.props.riders}
            showRiderProfile={this.props.showRiderProfile}
            userPhotos={this.props.userPhotos}
            user={this.props.user}
          />
        </CardItem>
      </Card>
    )
  }
}

const styles = StyleSheet.create({});
