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

import { darkGrey, lightGrey }  from '../../colors'

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
    let avatar
    if (this.props.userPhotos.get(item.profilePhotoID)) {
      avatar = <Thumbnail size={30} source={{uri: this.props.userPhotos.getIn([item.profilePhotoID, 'uri'])}} />
    } else {
      avatar = <Thumbnail size={30} source={require('../../img/emptyProfile.png')} />
    }

    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={{height: 80}}
          onPress={this.showProfile(item)}
        >
          <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: darkGrey, padding: 20}}>
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
    return (
      <View style={styles.container}>
        <ScrollView style={{flex: 1, borderTopWidth: 2, borderTopColor: lightGrey}}>
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
