import React, { Component } from 'react'
import { Avatar } from 'react-native-elements'
import {
  Button,
  Content,
  Card,
  CardItem,
  Icon,
  Left,
  ListItem,
  Right,
  Text
} from 'native-base';
import {
  Image,
  StyleSheet,
  View,
} from 'react-native';

import { staticMap } from '../../helpers'
import { PROFILE } from '../../screens'

export default class RideCard extends Component {
  constructor (props) {
    super(props)
    this.showComments = this.showComments.bind(this)
    this.showProfile = this.showProfile.bind(this)
    this.toggleCarrot = this.toggleCarrot.bind(this)
  }

  toggleCarrot () {
    this.props.toggleCarrot(this.props.ride._id)
  }

  showComments () {
    this.props.showComments(this.props.ride)
  }

  showProfile () {
    const user = this.props.user
    let name = 'Unknown Name'
    if (user.firstName || user.lastName) {
      name = `${user.firstName || ''} ${user.lastName || ''}`
    }

    this.props.navigator.push({
      screen: PROFILE,
      title: name,
      animationType: 'slide-up',
      passProps: {
        user,
        userProfilePhotoURL: this.props.userProfilePhotoURL
      }
    })
  }

  render() {
    return (
      <ListItem
        onPress={() => {this.props.showRide(this.props.ride)}}
      >
        <Content>
          <Card>
            <CardItem header>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                  <Avatar
                    source={{uri: this.props.userProfilePhotoURL}}
                    onPress={this.showProfile}
                    activeOpacity={0.7}
                  />
                </View>
                <View style={{flex: 5}}>
                  <Text>{this.props.ride.name}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Avatar
                    small
                    rounded
                    source={{uri: this.props.horseProfilePhotoURL}}
                    onPress={() => console.log("Works!")}
                    activeOpacity={0.7}
                  />
                </View>
              </View>
            </CardItem>
            <CardItem cardBody>
              <Image
                source={{uri: this.props.ride.mapURL}}
                style={{height: 200, width: null, flex: 1}}
              />
            </CardItem>
            <CardItem footer>
              <Left>
                <Button transparent onPress={this.toggleCarrot}>
                  <Icon active name="thumbs-up" />
                  <Text>{this.props.rideCarrots.length} Carrots</Text>
                </Button>
              </Left>
              <Right>
                <Button transparent onPress={this.showComments}>
                  <Icon active name="chatbubbles" />
                  <Text>{this.props.rideComments.length} comments</Text>
                </Button>
              </Right>
            </CardItem>
          </Card>
        </Content>
      </ListItem>
    )
  }
}

const styles = StyleSheet.create({
  rideTitle: {
    fontSize: 24
  }
});
