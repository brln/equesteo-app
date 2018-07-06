import React, { Component } from 'react';
import { Navigation } from 'react-native-navigation'
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
} from 'react-native';
import { Icon, Fab } from 'native-base';

import { black, brand, green } from '../colors'
import { NEW_HORSE } from '../screens'


export default class Barn extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.newHorse = this.newHorse.bind(this)
    this.saveNewHorse = this.saveNewHorse.bind(this)
  }

  newHorse () {
    Navigation.showModal({
      screen: NEW_HORSE,
      title: 'New Horse',
      animationType: 'slide-up',
      passProps: {
        saveNewHorse: this.saveNewHorse
      }
    })
  }

  saveNewHorse (horseData) {
    Navigation.dismissModal({
      animationType: 'slide-down'
    })
    this.props.saveNewHorse(horseData)
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            margin: 30
          }}>
            {
              [...this.props.horses.map((horse, i) => {
                let source = require('../img/emptyHorseBlack.png')
                if (horse.profilePhotoID) {
                  source = {uri: horse.photosByID[horse.profilePhotoID].uri}
                }
                return (
                  <View key={i} elevation={5} style={{
                    marginBottom: 20,
                    backgroundColor: brand,
                    shadowColor: black,
                    shadowOffset: {
                      width: 0,
                      height: 3
                    },
                    shadowRadius: 5,
                    shadowOpacity: 1.0
                  }}>
                    <TouchableOpacity
                      onPress={() => {this.props.horseProfile(horse)}}
                    >
                      <View
                        key={i}
                        title={horse.name}
                        style={{flex: 1}}
                      >
                        <View style={{flex: 1, alignItems: 'center', paddingBottom: 5}}>
                          <Image
                            source={source}
                            style={{height: 120, width: 120, margin: 10}}
                          />
                          <Text>{horse.name}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                )
              })]
            }
          </View>
        </ScrollView>
        <Fab
          active={this.state.active}
          direction="up"
          containerStyle={{ }}
          style={{ backgroundColor: brand }}
          position="bottomRight"
          onPress={this.newHorse}>
          <Icon name="ios-add" />
        </Fab>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  header: {
    padding: 20,
    fontSize: 24,
    fontWeight: 'bold'
  }
});
