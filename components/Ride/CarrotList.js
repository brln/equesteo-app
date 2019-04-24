import { fromJS } from 'immutable'
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

const { width } = Dimensions.get('window')

import { darkGrey, lightGrey }  from '../../colors'
import Thumbnail from '../Images/Thumbnail'

export default class CarrotList extends PureComponent {
  constructor (props) {
    super(props)
    this.renderResult = this.renderResult.bind(this)
    this.showProfile = this.showProfile.bind(this)
  }

  showProfile (showUser) {
    return () => {
      this.props.showProfile(fromJS(showUser))
    }
  }

  renderResult ({item}) {
    let toDo = this.showProfile(item)
    if (item._id === this.props.userID) {
      toDo = this.props.toggleCarrot
    }
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={{height: 80}}
          onPress={toDo}
        >
          <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: darkGrey, padding: 20}}>
            <View style={{flex: 1, justifyContent:'center'}}>
              <Thumbnail
                source={{uri: this.props.userPhotos.getIn([item.profilePhotoID, 'uri'])}}
                emptySource={require('../../img/emptyProfile.png')}
                empty={!this.props.userPhotos.get(item.profilePhotoID)}
                height={width / 7}
                width={width/ 7}
                round={true}
              />
            </View>
            <View style={{flex: 3, justifyContent: 'center'}}>
              <Text>{`${item.firstName || ''} ${item.lastName || ''}`}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  giveCarrot () {
    const hasGiven = this.props.rideCarrots.filter(rc => {
      return rc.get('userID') === this.props.userID && rc.deleted !== true
    }).count() > 0
    if (!hasGiven) {
      return (
        <View style={{flex: 1}}>
          <TouchableOpacity
            style={{height: 80}}
            onPress={this.props.toggleCarrot}
          >
            <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: darkGrey, padding: 20}}>
              <View style={{flex: 1, justifyContent:'center'}}>
                <Thumbnail
                  emptySource={require('../../img/plus.png')}
                  empty={true}
                  height={width / 7}
                  width={width/ 7}
                  round={true}
                />
              </View>
              <View style={{flex: 3, justifyContent: 'center'}}>
                <Text>Give Carrot</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={{flex: 1, borderTopWidth: 2, borderTopColor: lightGrey}}>
          <FlatList
            keyExtractor={(u) => u._id}
            containerStyle={{marginTop: 0}}
            data={this.props.users.toJS()}
            renderItem={this.renderResult}
          />
          { this.giveCarrot() }
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
});
