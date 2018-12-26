import React, { PureComponent } from 'react';
import {
  Thumbnail,
} from 'native-base';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import moment from 'moment'
import { darkGrey } from '../../colors'
import { userName } from '../../modelHelpers/user'

export default class CommentList extends PureComponent {
  constructor (props) {
    super(props)
    this.singleComment = this.singleComment.bind(this)
  }

  commentProfilePhotoURL (user) {
    const profilePhotoID = user.get('profilePhotoID')
    let profilePhotoURL = null
    if (profilePhotoID) {
      profilePhotoURL = this.props.userPhotos.getIn([profilePhotoID, 'uri'])
    }
    return profilePhotoURL
  }


  userAvatar (user) {
    let source
    let photoURL = this.commentProfilePhotoURL(user)
    if (photoURL) {
      source = {uri: photoURL}
    } else {
      source = require('../../img/empty.png')
    }
    return (
      <View
        style={{flex: 1}}
      >
        <Thumbnail
          small
          source={source}
        />
      </View>
    )
  }

  singleComment({item}) {
    const rideComment = item
    const commentUser = this.props.users.get(rideComment.userID)
    return (
      <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: darkGrey, padding: 20}} key={rideComment._id}>
        { this.userAvatar(commentUser) }
        <View style={{flex: 6}}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flex: 1}}>
            <Text
              style={{fontWeight: 'bold', color: 'black'}}
            >
              { userName(commentUser) }
            </Text>
            </View>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <Text>{moment(rideComment.timestamp).format('MM/DD h:mm a')}</Text>
            </View>
          </View>
          <Text note>{rideComment.comment}</Text>
        </View>
      </View>
    )
  }

  render() {
    return (
      <FlatList
        data={this.props.rideComments.toJS()}
        keyExtractor={(i) => i._id}
        renderItem={this.singleComment}
      />
    )
  }
}

const styles = StyleSheet.create({});
