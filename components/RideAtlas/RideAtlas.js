import { fromJS, Map } from 'immutable'
import React, { PureComponent } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import BuildImage from '../Images/BuildImage'
import { darkGrey }  from '../../colors'
import RideMapImage from '../Feed/RideMapImage'

const { width } = Dimensions.get('window')

export default class RideAtlas extends PureComponent {
  constructor (props) {
    super(props)
    this.renderResult = this.renderResult.bind(this)
  }

  renderResult ({item}) {
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={{height: 80}}
          onPress={this.props.setActiveAtlasEntry(item._id)}
        >
          <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: darkGrey, padding: 20}}>
            <View style={{flex: 1, justifyContent:'center'}}>
              <RideMapImage
                uri={item.ride.mapURL}
                style={{height: 50, resizeMode: 'contain', width: null, flex: 1}}
              />
            </View>
            <View style={{flex: 3, justifyContent: 'center', paddingLeft: 20}}>
              <Text>{item.name}</Text>
            </View>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <TouchableOpacity style={{height: 40, width: 40}} onPress={this.props.deleteRideAtlasEntry(item._id)}>
                  <BuildImage
                    source={require('../../img/trash.png')}
                    style={{flex: 1, height: 30, width: 30, resizeMode: 'contain'}}
                  />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={{flex: 1}}>
          <FlatList
            keyExtractor={(u) => u._id}
            containerStyle={{marginTop: 0}}
            data={this.props.rideAtlasEntries}
            renderItem={this.renderResult}
          />
        </ScrollView>
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
    width: '100%'
  },
})
