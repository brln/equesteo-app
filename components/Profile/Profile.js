import { Map } from 'immutable'
import React, { PureComponent } from 'react';
import ImagePicker from 'react-native-image-crop-picker'
import {
  Card,
  CardItem,
  Fab,
} from 'native-base';
import {
  Alert,
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import BuildImage from '../Images/BuildImage'
import { brand, danger, darkBrand, darkGrey, green, lightGrey } from '../../colors'
import FollowersCard from './FollowersCard'
import { logRender, logError, logInfo } from '../../helpers'
import { userName } from '../../modelHelpers/user'
import PhotoFilmstrip from '../Ride/PhotoFilmstrip'
import Thumbnail from '../Images/Thumbnail'
import TrainingCard from '../HorseProfile/TrainingCard'
import MedImage from '../Images/MedImage'
import SquaresCard from './SquaresCard'

import FabImage from '../FabImage'

const { width, height } = Dimensions.get('window')

export default class Profile extends PureComponent {
  constructor (props) {
    super(props)
    this.follow = this.follow.bind(this)
    this.unfollow = this.unfollow.bind(this)
    this.horseProfile = this.horseProfile.bind(this)
    this.horsesCard = this.horsesCard.bind(this)
    this.photoSources = this.photoSources.bind(this)
    this.renderHorse = this.renderHorse.bind(this)
    this.showUserList = this.showUserList.bind(this)
    this.uploadProfile = this.uploadProfile.bind(this)
  }

  uploadProfile () {
    ImagePicker.openPicker({
      width: 1080,
      height: 1080,
      cropping: true
    }).then(image => {
      this.props.uploadPhoto(image.path)
    }).catch(e => {
      if (e.code && e.code === 'E_PERMISSION_MISSING') {
        Alert.alert('Denied', 'You denied permission to access photos. Please enable via permissions settings for Equesteo.')
      } else {
        logError(e, 'Profile.Profile.uploadProfile')
      }
    })
  }

  follow () {
    this.props.createFollow(this.props.profileUser.get('_id'))
  }

  unfollow () {
    this.props.deleteFollow(this.props.profileUser.get('_id'))
  }

  horseProfile (horse) {
    return () => {
      const ownerID = this.props.horseOwnerIDs.get(horse.get('_id'))
      this.props.showHorseProfile(horse, ownerID)
    }
  }

  renderHorse ({item}) {
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={{height: 80}}
          onPress={this.horseProfile(Map(item))}
        >
          <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: darkGrey, padding: 20}}>
            <View style={{flex: 1, justifyContent:'center'}}>
              <Thumbnail
                source={{uri: this.props.horsePhotos.getIn([item.profilePhotoID, 'uri'])}}
                emptySource={require('../../img/emptyHorseBlack.png')}
                empty={!item.profilePhotoID}
                height={width / 7}
                width={width/ 7}
                round={true}
              />
            </View>
            <View style={{flex: 3, justifyContent: 'center'}}>
              <Text>{`${item.name || 'No Name'}`}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  renderHorses (horses) {
    if (horses.count() > 0) {
      return (
        <View style={{flex: 1, borderTopWidth: 2, borderTopColor: lightGrey}}>
          <FlatList
            data={horses.toJS()}
            renderItem={this.renderHorse}
            keyExtractor={(i) => i._id}
            ItemSeparatorComponent={null}
          />
        </View>
      )
    }
  }

  photoSources (selectedID) {
    const sources = this.props.userPhotos.reduce((accum, photo, photoID) => {
      if (photoID !== selectedID) {
        accum.push({url: photo.get('uri')})
      }
      return accum
    }, [])
    sources.unshift({url: this.props.userPhotos.getIn([selectedID, 'uri'])})
    return sources
  }

  renderProfileImage () {
    const images = []
    const user = this.props.profileUser
    if (this.props.profilePhotoURL) {
      // got here from FindPeople
      images.push(
        <MedImage
          onPress={() => {this.props.showPhotoLightbox([this.props.profilePhotoURL])}}
          key={"profile"}
          style={{width: '100%', height: '100%'}}
          source={{uri: this.props.profilePhotoURL}}
          onError={() => logInfo("Can't load Profile image")}
        />
      )
    } else {
      if (user.get('profilePhotoID')) {
        const profileSource = {uri: this.props.userPhotos.getIn([user.get('profilePhotoID'), 'uri'])}
        const profileSources = this.photoSources(user.get('profilePhotoID'))
        images.push(
          <MedImage
            onPress={() => {this.props.showPhotoLightbox(profileSources)}}
            key={"profile"}
            style={{width: '100%', height: '100%'}}
            source={profileSource}
            onError={() => logInfo("Can't load Profile image")}
            showSource={true}
          />
        )
      } else {
        images.push(
          <View style={styles.slide} key={"empty"}>
            <BuildImage
              style={{width: '100%', height: '100%'}}
              source={require('../../img/emptyProfile.png')}
              onError={() => logInfo("Can't load empty profile image")}
            />
          </View>
        )
      }
    }
    return images
  }

  renderImageSwiper () {
    let fab
    let followButton
    if (this.props.profileUser.get('_id') === this.props.userID) {
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
      if (this.props.followingSyncRunning) {
        followButton = (
          <View style={styles.followButton}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{paddingLeft: 10}}>
                <ActivityIndicator color="white"/>
              </View>
              <Text style={[styles.followText]}>Loading User Data...</Text>
            </View>
          </View>
        )
      } else {
        followButton = (
          <TouchableOpacity
            style={styles.followButton}
            onPress={this.follow}
            underlayColor={green}
          >
            <Text style={styles.followText}>Follow</Text>
          </TouchableOpacity>
        )
        for (let follow of this.props.followers.valueSeq()) {
          if (follow.get('followingID') === this.props.profileUser.get('_id')
            && follow.get('followerID') === this.props.userID) {
            followButton = (
              <TouchableOpacity
                style={styles.unfollowButton}
                onPress={this.unfollow}
                underlayColor={danger}
              >
                <Text style={styles.followText}>Unfollow</Text>
              </TouchableOpacity>
            )
            break
          }
        }
      }
    }

    return (
      <View>
        <View style={{height: ((height / 2) - 20)}}>
          {this.renderProfileImage()}
          { fab }
          <View style={{position: 'absolute', bottom: 10, right: 10}}>
            { followButton }
          </View>
        </View>
        <PhotoFilmstrip
          photosByID={this.props.userPhotos}
          showPhotoLightbox={this.props.showPhotoLightbox}
          exclude={[this.props.profileUser.get('profilePhotoID')]}
        />
      </View>
    )
  }

  horsesCard () {
    if (this.props.horses.count() > 0 && this.props.oneDegreeUser) {
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
      this.props.showUserList(followRecords, followingOrFollower)
    }
  }

  render() {
    logRender('ProfileComponent')

    let aboutButton = null
    if (this.props.profileUser.get('_id') === this.props.userID) {
      aboutButton = (
          <View style={{width, flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 30}}>
            <TouchableOpacity
              style={styles.aboutButton}
              underlayColor={green}
              onPress={this.props.showAboutPage}
            >
              <Text style={styles.followText}>About Equesteo</Text>
            </TouchableOpacity>
          </View>
      )
    }

    return (
      <ScrollView>
        {this.renderImageSwiper()}
        <View style={{flex: 1}}>
          <FollowersCard
            followers={this.props.followers}
            followings={this.props.followings}
            profileUser={this.props.profileUser}
            showUserList={this.showUserList}
            userID={this.props.userID}
            visible={this.props.oneDegreeUser}
          />
          <SquaresCard
            trainings={this.props.trainings}
            visible={this.props.oneDegreeUser || this.props.leaderboardProfile}
          />

          <TrainingCard
            trainings={this.props.trainings}
            visible={this.props.oneDegreeUser || this.props.leaderboardProfile}
          />

          <Card>
            <CardItem header style={{padding: 5}}>
              <View style={{paddingLeft: 5}}>
                <View>
                  <Text style={{color: darkBrand}}>Name</Text>
                </View>
              </View>
            </CardItem>
            <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
              <Text>{ userName(this.props.profileUser) }</Text>
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
          { aboutButton }
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
  unfollowButton:{
    marginTop:10,
    paddingTop:10,
    paddingBottom:10,
    backgroundColor: danger ,
    borderRadius:10,
    borderWidth: 1,
    borderColor: '#fff'
  },
  followButton:{
    marginTop:10,
    paddingTop:10,
    paddingBottom:10,
    backgroundColor: green ,
    borderRadius:10,
    borderWidth: 1,
    borderColor: '#fff'
  },
  followText:{
    color:'#fff',
    textAlign:'center',
    paddingLeft : 10,
    paddingRight : 10
  },
  aboutButton: {
    marginRight:40,
    marginLeft:40,
    marginTop:10,
    paddingTop:10,
    paddingBottom:10,
    backgroundColor: brand,
    borderRadius:10,
  }
});
