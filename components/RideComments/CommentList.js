import React, { Component } from 'react';
import {
  Body,
  Left,
  ListItem,
  Right,
  Thumbnail,
  Text
} from 'native-base';
import {
  FlatList,
  ScrollView,
  StyleSheet,
} from 'react-native';
import moment from 'moment'

export default class CommentList extends Component {
  constructor (props) {
    super(props)
    this.singleComment = this.singleComment.bind(this)
  }

  shouldComponentUpdate (nextProps) {
    return this.props.rideComments.length !== nextProps.rideComments.length
  }

  commentProfilePhotoURL (user) {
    const profilePhotoID = user.profilePhotoID
    let profilePhotoURL = null
    if (profilePhotoID) {
      profilePhotoURL = user.photosByID[profilePhotoID].uri
    }
    return profilePhotoURL
  }

  singleComment({item}) {
    const rideComment = item
    const commentUser = this.props.users[rideComment.userID]
    return (
      <ListItem avatar key={rideComment._id}>
        <Left>
          <Thumbnail source={{ uri: this.commentProfilePhotoURL(commentUser) }} />
        </Left>
        <Body>
        <Text>{commentUser.firstName || ''} {commentUser.lastName || ''}</Text>
        <Text note>{rideComment.comment}</Text>
        </Body>
        <Right>
          <Text note>{moment(rideComment.timestamp).format('MM/DD hh:mm a')}</Text>
        </Right>
      </ListItem>
    )
  }

  render() {
    console.log('rendering CommentList')
    return (
      <ScrollView>
        <FlatList
          data={this.props.rideComments}
          keyExtractor={(i) => i._id}
          renderItem={this.singleComment}
        />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({});
