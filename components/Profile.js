import React, { Component } from 'react';
import Swiper from 'react-native-swiper';
import ImagePicker from 'react-native-image-crop-picker'
import {
  Body,
  Card,
  CardItem,
  Fab,
  ListItem,
  Left,
  Thumbnail,
} from 'native-base';
import {
  Button,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { danger, darkBrand, green } from '../colors'
import { HORSE_PROFILE } from '../screens'
import { brand } from '../colors'
import SwipablePhoto from './SwipablePhoto'
import FabImage from './FabImage'

const { height } = Dimensions.get('window')

export default class Profile extends Component {
  constructor (props) {
    super(props)
    this.follow = this.follow.bind(this)
    this.unfollow = this.unfollow.bind(this)
    this.horseProfile = this.horseProfile.bind(this)
    this.horsesCard = this.horsesCard.bind(this)
    this.renderHorse = this.renderHorse.bind(this)
    this.uploadProfile = this.uploadProfile.bind(this)
  }

  uploadProfile () {
    ImagePicker.openPicker({
      width: 1080,
      height: 1080,
      cropping: true
    }).then(image => {
      this.props.uploadProfilePhoto(image.path)
    });
  }

  follow () {
    this.props.createFollow(this.props.profileUser._id)
  }

  unfollow () {
    this.props.deleteFollow(this.props.profileUser._id)
  }

  horseProfile (horse) {
    let rightButtons = []
    if (this.props.profileUser._id === this.props.user._id) {
      rightButtons.push(
        {
          icon: require('../img/threedot.png'),
          id: 'dropdown',
        }
      )
    }
    return () => {
      this.props.navigator.push({
        screen: HORSE_PROFILE,
        title: horse.name,
        passProps: {
          horse: horse,
          horseUser: this.props.profileUser,
          user: this.props.user,
        },
        rightButtons
      })
    }

  }

  renderHorse ({item}) {
    let uri = 'https://s3.us-west-1.amazonaws.com/equesteo-horse-photos/empty.png'
    if (item.profilePhotoID && item.photosByID[item.profilePhotoID]) {
      uri = item.photosByID[item.profilePhotoID].uri
    }
    return (
      <ListItem avatar noBorder={true} style={{height: 80}} onPress={this.horseProfile(item)}>
        <Left>
          <Thumbnail size={30} source={{ uri }} />
        </Left>
        <Body>
          <Text>{item.name}</Text>
        </Body>
      </ListItem>
    )
  }

  renderHorses (horses) {
    if (horses.length > 0) {
      return (
        <FlatList
          data={horses}
          renderItem={this.renderHorse}
          keyExtractor={(i) => i._id}
          ItemSeparatorComponent={null}
        />
      )
    }
  }

  renderImages () {
    const images = []
    const user = this.props.profileUser
    if (Object.keys(user.photosByID).length > 0) {
      images.push(
        <SwipablePhoto
          key="profile"
          source={{uri: user.photosByID[user.profilePhotoID].uri}}
          navigator={this.props.navigator}
        />
      )
      for (let imageID of Object.keys(user.photosByID)) {
        if (imageID !== user.profilePhotoID) {
          images.push(
            <SwipablePhoto
              key={imageID}
              source={{uri: user.photosByID[imageID].uri}}
              navigator={this.props.navigator}
            />
          )
        }
      }

    } else {
      images.push(
        <SwipablePhoto key="empty" source={require('../img/emptyProfile.png')} />
      )
    }
    return images
  }

  renderImageSwiper () {
    let fab
    let followButton
    if (this.props.profileUser._id === this.props.user._id) {
      fab = (
        <Fab
          direction="up"
          style={{ backgroundColor: brand }}
          position="bottomRight"
          onPress={this.uploadProfile}>
          <FabImage source={require('../img/addphoto.png')} height={30} width={30} />
        </Fab>
      )
    } else {
      followButton = (
        <Button
          style={styles.followButton}
          color={green}
          onPress={this.follow}
          title="Follow"
        />
      )
      for (let follow of this.props.follows) {
        if (follow.followingID === this.props.profileUser._id) {
          followButton = (
            <Button
              style={styles.followButton}
              color={danger}
              onPress={this.unfollow}
              title="Unfollow"
            />
          )
          break
        }
      }
    }

    return (
      <View style={{height: ((height / 2) - 20)}}>
        <Swiper loop={false} showsPagination={false}>
          {this.renderImages()}
        </Swiper>
        { fab }
        <View style={{position: 'absolute', width: 150, bottom: 10, right: 10}}>
          { followButton }
        </View>
      </View>
    )
  }

  horsesCard () {
    if (this.props.horses.length > 0) {
      return (
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
      )
    }
  }

  render() {
    return (
      <ScrollView>
        {this.renderImageSwiper()}
        <View style={{flex: 1}}>
          <Card>
            <CardItem header style={{padding: 5}}>
              <View style={{paddingLeft: 5}}>
                <Text style={{color: darkBrand}}>Name</Text>
              </View>
            </CardItem>
            <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
              <Text>{this.props.profileUser.firstName || ''} {this.props.profileUser.lastName || ''}</Text>
            </CardItem>

            <CardItem header style={{padding: 5}}>
              <View style={{paddingLeft: 5}}>
                <Text style={{color: darkBrand}}>About Me</Text>
              </View>
            </CardItem>
            <CardItem cardBody style={{marginLeft: 20, marginBottom: 20, marginRight: 20}}>
              <Text>{this.props.profileUser.aboutMe || 'nothing'}</Text>
            </CardItem>
          </Card>

          { this.horsesCard() }

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
