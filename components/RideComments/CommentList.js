import moment from 'moment'
import React, { PureComponent } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { darkGrey } from '../../colors'
import { userName } from '../../modelHelpers/user'
import Thumbnail from '../Images/Thumbnail'

const { width } = Dimensions.get('window')

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

  showProfile (user) {
    return () => {
      this.props.showProfile(user)
    }
  }

  singleComment({item}) {
    const rideComment = item
    const commentUser = this.props.users.get(rideComment.userID)
    const commentProfilePhotoURL = this.commentProfilePhotoURL(commentUser)
    return (
      <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: darkGrey, padding: 10}} key={rideComment._id}>
        <TouchableOpacity onPress={this.showProfile(commentUser)}>
          <Thumbnail
            source={{uri: commentProfilePhotoURL}}
            emptySource={require('../../img/empty.png')}
            empty={!commentProfilePhotoURL}
            height={width / 9}
            width={width/ 9}
            round={true}
            padding={5}
          />
        </TouchableOpacity>
        <View style={{flex: 6, justifyContent: 'flex-start'}}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flex: 1}}>
              <Text
                style={{fontWeight: 'bold', color: 'black'}}
              >
                { userName(commentUser) }
              </Text>
            </View>
            <View style={{flex: 2, alignItems: 'flex-end'}}>
              <Text>{moment(rideComment.timestamp).format('MM/DD h:mm a')}</Text>
            </View>
          </View>
          <View style={{flex: 2}}>
            <Text note>{rideComment.comment}</Text>
          </View>
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
