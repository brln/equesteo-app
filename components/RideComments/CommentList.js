import React, { PureComponent } from 'react';
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

export default class CommentList extends PureComponent {
  constructor (props) {
    super(props)
    this.singleComment = this.singleComment.bind(this)
  }

  commentProfilePhotoURL (user) {
    const profilePhotoID = user.get('profilePhotoID')
    let profilePhotoURL = null
    if (profilePhotoID) {
      profilePhotoURL = user.getIn(['photosByID', profilePhotoID]).uri
    }
    return profilePhotoURL
  }

  singleComment({item}) {
    const rideComment = item
    const commentUser = this.props.users.get(rideComment.userID)
    return (
      <ListItem avatar key={rideComment._id}>
        <Left>
          <Thumbnail source={{ uri: this.commentProfilePhotoURL(commentUser) }} />
        </Left>
        <Body>
        <Text>{commentUser.get('firstName') || ''} {commentUser.get('lastName') || ''}</Text>
        <Text note>{rideComment.comment}</Text>
        </Body>
        <Right>
          <Text note>{moment(rideComment.timestamp).format('MM/DD hh:mm a')}</Text>
        </Right>
      </ListItem>
    )
  }

  render() {
    return (
      <ScrollView>
        <FlatList
          data={this.props.rideComments.toJS()}
          keyExtractor={(i) => i._id}
          renderItem={this.singleComment}
        />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({});
