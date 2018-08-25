import { Map } from 'immutable'
import React, { PureComponent } from 'react';
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
  TouchableOpacity,
  View
} from 'react-native';

import { brand, danger, darkBrand, green } from '../../colors'
import { logRender } from '../../helpers'
import { FOLLOW_LIST, HORSE_PROFILE } from '../../screens'
import SwipablePhoto from '../SwipablePhoto'
import FabImage from '../FabImage'

const { height } = Dimensions.get('window')

export default class Profile extends PureComponent {
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
    }).catch(() => {})
  }

  follow () {
    this.props.createFollow(this.props.profileUser.get('_id'))
  }

  unfollow () {
    this.props.deleteFollow(this.props.profileUser.get('_id'))
  }

  horseProfile (horse) {
    let rightButtons = []
    if (this.props.user.get('_id') === this.props.horseOwnerIDs.get(horse.get('_id'))) {
      rightButtons = [
        {
          title: "Edit",
          id: 'edit',
        },
        {
          title: "Archive",
          id: 'archive',
        }
      ]
    }
    return () => {
      this.props.navigator.push({
        screen: HORSE_PROFILE,
        title: horse.get('name'),
        passProps: { horse },
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
      <ListItem
        avatar
        noBorder={true}
        style={{height: 80}}
        onPress={this.horseProfile(Map(item))}
      >
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
    if (horses.count() > 0) {
      return (
        <FlatList
          data={horses.toJS()}
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
    if (user.get('profilePhotoID')) {
      images.push(
        <SwipablePhoto
          key="profile"
          source={{uri: user.getIn(['photosByID', user.get('profilePhotoID'), 'uri'])}}
          navigator={this.props.navigator}
        />
      )
    }
    if (user.get('photosByID').keySeq().count() > 0) {
      for (let imageID of user.get('photosByID').keySeq()) {
        if (imageID !== user.get('profilePhotoID')) {
          images.push(
            <SwipablePhoto
              key={imageID}
              source={{uri: user.getIn(['photosByID', imageID, 'uri'])}}
              navigator={this.props.navigator}
            />
          )
        }
      }
    } else {
      images.push(
        <SwipablePhoto key="empty" source={require('../../img/emptyProfile.png')} />
      )
    }
    return images
  }

  renderImageSwiper () {
    let fab
    let followButton
    if (this.props.profileUser.get('_id') === this.props.user.get('_id')) {
      fab = (
        <Fab
          direction="up"
          style={{ backgroundColor: brand }}
          position="bottomRight"
          onPress={this.uploadProfile}>
          <FabImage source={require('../../img/addphoto.png')} height={30} width={30} />
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
      for (let follow of this.props.followers.valueSeq()) {
        if (follow.get('followingID') === this.props.profileUser.get('_id')
          && follow.get('followerID') === this.props.user.get('_id')) {
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
    if (this.props.horses.count() > 0) {
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

  showUserList (followRecords, followingOrFollower) {
    return () => {
      const userIDs = followRecords.valueSeq().map((f) => f.get(followingOrFollower))
      this.props.navigator.push({
        screen: FOLLOW_LIST,
        animationType: 'slide-up',
        passProps: {
          userIDs: userIDs.toJS(),
        }
      })
    }
  }

  render() {
    logRender('ProfileComponent')
    return (
      <ScrollView>
        {this.renderImageSwiper()}
        <View style={{flex: 1}}>
          <Card>
            <CardItem>
              <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                <View style={{flex: 1}} />
                <View style={{flex: 2, paddingLeft: 5, flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={{color: darkBrand, paddingRight: 10}}>Followers:</Text>
                  <TouchableOpacity onPress={this.showUserList(this.props.followers, 'followerID')}>
                    <Text style={{fontSize: 24}}>{this.props.followers.count()}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{flex: 2, paddingLeft: 5, flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={{color: darkBrand, paddingRight: 10}}>Following:</Text>
                  <TouchableOpacity onPress={this.showUserList(this.props.followings, 'followingID')}>
                    <Text style={{fontSize: 24}}>{this.props.followings.count()}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{flex: 1}} />
              </View>
            </CardItem>
          </Card>

          <Card>
            <CardItem header style={{padding: 5}}>
              <View style={{paddingLeft: 5}}>
                <Text style={{color: darkBrand}}>Name</Text>
              </View>
            </CardItem>
            <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
              <Text>{this.props.profileUser.get('firstName') || ''} {this.props.profileUser.get('lastName') || ''}</Text>
            </CardItem>

            <CardItem header style={{padding: 5}}>
              <View style={{paddingLeft: 5}}>
                <Text style={{color: darkBrand}}>About Me</Text>
              </View>
            </CardItem>
            <CardItem cardBody style={{marginLeft: 20, marginBottom: 20, marginRight: 20}}>
              <Text>{this.props.profileUser.get('aboutMe') || 'nothing'}</Text>
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
