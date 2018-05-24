import React, { Component } from 'react';
import {
  List,
  ListItem,
  Left,
  Body,
  Right,
  Thumbnail,
  Text
} from 'native-base';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import moment from 'moment'

export default class RideComments extends Component {
  constructor (props) {
    super(props)
    this.singleComment = this.singleComment.bind(this)
  }

  commentProfilePhotoURL (user) {
    const profilePhotoID = user.profilePhotoID
    let profilePhotoURL = null
    if (profilePhotoID) {
      profilePhotoURL = user.photosByID[profilePhotoID].uri
    }
    return profilePhotoURL
  }

  singleComment(rideComment) {
    const commentUser = this.props.users.filter((u) => u._id === rideComment.userID)[0]
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
    return (
      <View style={styles.container}>
        <Text>
          New Comment:
        </Text>
        <TextInput
          onChangeText={this.props.updateNewComment}
          value={this.props.newComment}
        />
        <ScrollView>
          <List>
            {this.props.rideComments.sort((a, b) => b.timestamp - a.timestamp).map((rc) => this.singleComment(rc))}
          </List>
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
  },
});
