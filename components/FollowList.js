import { fromJS } from 'immutable'
import React, { PureComponent } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  Thumbnail,
} from 'native-base'

import { darkGrey }  from '../colors'
import { PROFILE } from '../screens'

export default class FollowList extends PureComponent {
  constructor (props) {
    super(props)
    this.renderResult = this.renderResult.bind(this)
  }

  showProfile (showUser) {
    return () => {
      this.props.navigator.push({
        screen: PROFILE,
        animationType: 'slide-up',
        passProps: {
          profileUser: fromJS(showUser),
        }
      })
    }
  }

  renderResult ({item}) {
    let avatar
    if (item.photosByID[item.profilePhotoID]) {
      avatar = <Thumbnail size={30} source={{uri: item.photosByID[item.profilePhotoID]}.uri} />
    } else {
      avatar = <Thumbnail size={30} source={require('../img/emptyProfile.png')} />
    }

    return (
      <View style={{flex: 1, borderBottomWidth: 1, borderColor: darkGrey}}>
        <TouchableOpacity
          style={{height: 80}}
          onPress={this.showProfile(item)}
        >
          <View style={{flex: 1, flexDirection: 'row', paddingLeft: 20}}>
            <View style={{flex: 1, justifyContent:'center'}}>
              { avatar }
            </View>
            <View style={{flex: 3, justifyContent: 'center'}}>
              <Text>{`${item.firstName || ''} ${item.lastName || ''}`}</Text>
            </View>
          </View>

        </TouchableOpacity>
      </View>
    )
  }

  render() {
    console.log(this.props.users.toJSON())
    return (
      <View style={styles.container}>
        <ScrollView style={{flex: 1}}>
          <FlatList
            keyExtractor={(u) => u._id}
            containerStyle={{marginTop: 0}}
            data={this.props.users.toJS()}
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
});
