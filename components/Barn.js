import React, { Component } from 'react';
import { Navigation } from 'react-native-navigation'
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
} from 'react-native';
import { Icon, Fab } from 'native-base';

import { black, brand } from '../colors'
import { UPDATE_HORSE } from '../screens'

const { width } = Dimensions.get('window')


export default class Barn extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.newHorse = this.newHorse.bind(this)
  }

  newHorse () {
    this.props.navigator.push({
      screen: UPDATE_HORSE,
      title: 'New Horse',
      animationType: 'slide-up',
      passProps: {
        newHorse: true
      }
    })
  }

  render() {
    const calcWidth = (width / 2) - 41
    return (
      <View style={{flex: 1}}>
        <ScrollView>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginTop: 30,
            marginBottom: 30,
            marginLeft: 10,
            marginRight: 10,
          }}>
            {
              [...this.props.horses.map((horse, i) => {
                let source = require('../img/emptyHorseBlack.png')
                if (horse.get('profilePhotoID')) {
                  source = {uri: horse.getIn(['photosByID', horse.get('profilePhotoID')]).uri}
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
                            style={{height: calcWidth, width: calcWidth, margin: 10}}
                          />
                          <View style={{
                            position: 'absolute',
                            alignItems: 'center',
                            justifyContent: 'center',
                            left: 5,
                            right: 5,
                            top: 5,
                            bottom: 5,
                            padding: 5
                          }}>
                            <Text style={{
                              textAlign: 'center',
                              fontSize: 20,
                              color: 'white',
                              textShadowColor: 'black',
                              textShadowRadius: 5,
                              textShadowOffset: {
                                width: -1,
                                height: 1
                              }}}>{horse.get('name')}</Text>
                          </View>
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
