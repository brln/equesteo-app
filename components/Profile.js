import React, { Component } from 'react';
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { profilePhotoURL } from '../helpers'


export default class Profile extends Component {
  constructor (props) {
    super(props)
    this.follow = this.follow.bind(this)
    this.unfollow = this.unfollow.bind(this)
  }

  follow () {
    this.props.createFollow(this.props.user.id)
  }

  unfollow () {
    this.props.deleteFollow(this.props.user.id)
  }

  render() {
    let uri = 'https://s3.amazonaws.com/equesteo-profile-photos/full_size/empty.png'
    if (this.props.user.profilePhotoID) {
      uri = profilePhotoURL(this.props.user.profilePhotoID)
    }
    let followButton = <Button color="green" onPress={this.follow} title="Follow" />
    for (let following of this.props.userData.following) {
      if (following.id === this.props.user.id) {
        followButton = <Button color="red" onPress={this.unfollow} title="Unfollow" />
        break
      }
    }
    return (
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.topSection}>
            <View style={{flex: 1, padding: 20}}>
              <Image style={styles.image} source={{uri: uri}} />
            </View>
            <View style={{flex: 1, padding: 5, left: -15}}>
              {followButton}
              <Text> Email: </Text>
              <Text>
                {this.props.user.email }
              </Text>

              <Text>First Name:</Text>
              <Text>
                {this.props.user.firstName || 'unknown'}
              </Text>

              <Text>Last Name:</Text>
              <Text>
                {this.props.user.lastName || 'unknown'}
              </Text>
            </View>
          </View>
          <View style={{flex: 3, padding: 20}}>
            <Text> About Me: </Text>
            <Text>
              {this.props.user.aboutMe || 'Nothing'}
            </Text>


          </View>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  topSection: {
    flex: 2.5,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  image: {
    width: 130,
    height: 130,
  },
  profileButton: {
    width: 130,
    paddingTop: 2,
  }
});
