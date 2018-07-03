import React, { Component } from 'react';
import {
  Button,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { profilePhotoURL } from '../helpers'

const { width } = Dimensions.get('window')


export default class Profile extends Component {
  constructor (props) {
    super(props)
    this.follow = this.follow.bind(this)
    this.unfollow = this.unfollow.bind(this)
  }

  follow () {
    this.props.createFollow(this.props.user._id)
  }

  unfollow () {
    this.props.deleteFollow(this.props.user._id)
  }

  render() {
    let source = require('../img/empty.png')
    if (this.props.user.profilePhotoID) {
      source = {uri: profilePhotoURL(this.props.user.profilePhotoID)}
    }
    let followButton = <Button color="green" onPress={this.follow} title="Follow" />
    for (let following of this.props.userData.following) {
      if (following === this.props.user._id) {
        followButton = <Button color="red" onPress={this.unfollow} title="Unfollow" />
        break
      }
    }
    return (
      <ScrollView>
        <View style={styles.container}>
          <View style={{flex: 2, width}}>
            <Image style={{width}} source={source} />
          </View>
          <View style={{flex: 3}}>
            <View>
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
  profileButton: {
    width: 130,
    paddingTop: 2,
  }
});
