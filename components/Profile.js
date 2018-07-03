import React, { Component } from 'react';
import {
  Body,
  Card,
  CardItem,
  ListItem,
  Left,
  Thumbnail,
} from 'native-base';
import {
  Button,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { profilePhotoURL } from '../helpers'
import { danger, darkBrand, green } from '../colors'

const { width, height } = Dimensions.get('window')


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

  renderHorse ({item}) {
    return (
      <ListItem avatar noBorder={true} style={{height: 80}} onPress={() => alert(item.name)}>
        <Left>
          <Thumbnail size={30} source={{uri: item.photosByID[item.profilePhotoID].uri}} />
        </Left>
        <Body>
          <Text>{item.name}</Text>
        </Body>
      </ListItem>
    )
  }

  renderHorses (horses) {
    return (
      <FlatList
        data={horses}
        renderItem={this.renderHorse}
        keyExtractor={(i) => i._id}
        ItemSeparatorComponent={null}
      />
    )
  }

  render() {
    let source = require('../img/empty.png')
    if (this.props.user.profilePhotoID) {
      source = {uri: profilePhotoURL(this.props.user.profilePhotoID)}
    }
    let followButton = <Button style={styles.followButton} color={green} onPress={this.follow} title="Follow" />
    for (let following of this.props.userData.following) {
      if (following === this.props.user._id) {
        followButton = <Button style={styles.followButton} color={danger} onPress={this.unfollow} title="Unfollow" />
        break
      }
    }
    const imageHeight = Math.round(height * 2 / 5)
    return (
      <ScrollView>
        <View style={{flex: 1}}>
          <View style={{flex: 2, width}}>
            <Image style={{width, height: imageHeight }} source={source} />
            <View style={{position: 'absolute', width: 150, bottom: 10, right: 10}}>
              {followButton}
            </View>
          </View>
          <View style={{flex: 3}}>
            <Card>
              <CardItem header style={{padding: 5}}>
                <View style={{paddingLeft: 5}}>
                  <Text style={{color: darkBrand}}>About Me</Text>
                </View>
              </CardItem>
              <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20}}>
                <Text>{this.props.user.aboutMe || 'nothing'}</Text>
              </CardItem>
            </Card>


            <Card>
              <CardItem header style={{padding: 5}}>
                <View style={{paddingLeft: 5}}>
                  <Text style={{color: darkBrand}}>Horses</Text>
                </View>
              </CardItem>
              <CardItem cardBody>
                {this.renderHorses(this.props.horses)}
              </CardItem>
            </Card>
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
  followButton: {
    backgroundColor: 'transparent',
  },
  profileButton: {
    width: 130,
    paddingTop: 2,
  }
});
