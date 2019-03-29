import React, { PureComponent } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view';


import BuildImage from '../Images/BuildImage'
import { darkBrand }  from '../../colors'
import { makeMessage } from '../../modelHelpers/notification'

const { height, width } = Dimensions.get('window')

export default class NotificationsList extends PureComponent {
  constructor (props) {
    super(props)
    this.renderResult = this.renderResult.bind(this)
  }

  renderResult ({item}) {
    const message = makeMessage(item)
    let icon
    let onPress
    switch (item.notificationType) {
      case 'newRide':
        icon = require('../../img/notifications/route.png')
        onPress = this.props.showAndClear(item._id, item.rideID, false)
        break
      case 'newComment':
        icon = require('../../img/notifications/comment.png')
        onPress = this.props.showAndClear(item._id, item.rideID, true)
        break
      case 'newCarrot':
        icon = require('../../img/notifications/carrot2.png')
        onPress = this.props.showAndClear(item._id, item.rideID, false)
        break
    }
    return (
      <TouchableOpacity key={item._id} onPress={onPress} style={styles.rowFront}>
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
          <View style={{flex: 1, paddingRight: 20, paddingTop: 10}}>
            <BuildImage
              source={icon}
              style={{width: height / 18, height: height / 18}}
            />
          </View>
          <View style={{flex: 8, justifyContent: 'center'}}>
            <Text style={{flex: 1, flexWrap: 'wrap', textAlignVertical: 'center'}}>{message}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }


  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={{flex: 1}} bounces={false}>
          <SwipeListView
            useFlatList
            keyExtractor={(u) => u._id}
            data={this.props.notifications.toJS()}
            renderItem={this.renderResult}
            renderHiddenItem={ () => (
              <View style={styles.rowBack} />
            )}
            leftOpenValue={width}
            rightOpenValue={-1 * width}
            onRowDidOpen={(notificationID) => {this.props.justClear(notificationID)}}
            swipeToOpenPercent={10}
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
  rowFront: {
		alignItems: 'center',
		backgroundColor: '#F5FCFF',
		borderBottomColor: 'black',
		borderBottomWidth: 1,
		justifyContent: 'center',
		minHeight: height / 10,
		padding: 10
	},
	rowBack: {
		alignItems: 'center',
		backgroundColor: darkBrand,
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingLeft: 15,
},
})


