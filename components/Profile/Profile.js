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
  Clipboard,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

import BuildImage from '../BuildImage'
import { brand, danger, darkBrand, green } from '../../colors'
import { logRender, logError, logInfo } from '../../helpers'
import PhotoFilmstrip from '../Ride/PhotoFilmstrip'
import URIImage from '../URIImage'

import FabImage from '../FabImage'

const { width, height } = Dimensions.get('window')

export default class Profile extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      touches: 0
    }
    this.follow = this.follow.bind(this)
    this.unfollow = this.unfollow.bind(this)
    this.horseProfile = this.horseProfile.bind(this)
    this.horsesCard = this.horsesCard.bind(this)
    this.maybeShowID = this.maybeShowID.bind(this)
    this.photoSources = this.photoSources.bind(this)
    this.renderHorse = this.renderHorse.bind(this)
    this.uploadProfile = this.uploadProfile.bind(this)
  }

  maybeShowID () {
    if (this.state.touches === 5) {
      const id = this.props.profileUser.get('_id')
      alert(id)
      Clipboard.setString(id)
      logInfo(id)
      this.setState({
        touches: 0
      })
    } else {
      this.setState({
        touches: this.state.touches + 1
      })
    }
  }

  uploadProfile () {
    ImagePicker.openPicker({
      width: 1080,
      height: 1080,
      cropping: true
    }).then(image => {
      this.props.uploadPhoto(image.path)
    }).catch(() => {})
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
    let uri = 'https://s3.us-west-1.amazonaws.com/equesteo-horse-photos/empty.png'
    if (item.profilePhotoID) {
      uri = this.props.horsePhotos.getIn([item.profilePhotoID, 'uri'])
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
    if (user.get('profilePhotoID')) {
      const profileSource = {uri: this.props.userPhotos.getIn([user.get('profilePhotoID'), 'uri'])}
      const profileSources = this.photoSources(user.get('profilePhotoID'))
      images.push(
        <TouchableOpacity
          style={styles.slide}
          onPress={() => {this.props.showPhotoLightbox(profileSources)}}
          key={"profile"}
        >
          <URIImage
            style={{width: '100%', height: '100%'}}
            source={profileSource}
            onError={e => logError("Can't load Profile image")}
            showSource={true}
          />
        </TouchableOpacity>
      )
    } else {
      images.push(
        <View style={styles.slide} key={"empty"}>
          <BuildImage
            style={{width: '100%', height: '100%'}}
            source={require('../../img/emptyProfile.png')}
            onError={e => logError("Can't load empty profile image")}
          />
        </View>
      )
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

    return (
      <View>
        <View style={{height: ((height / 2) - 20)}}>
          <Swiper loop={false} showsPagination={false}>
            {this.renderProfileImage()}
          </Swiper>
          { fab }
          <View style={{position: 'absolute', width: 150, bottom: 10, right: 10}}>
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
          <Card>
            <CardItem>
              <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                <View style={{flex: 1}} />
                  <TouchableOpacity
                    onPress={this.showUserList(this.props.followers, 'followerID')}
                    style={{flex: 2, paddingLeft: 5, flexDirection: 'row', alignItems: 'center'}}
                  >
                    <Text style={{color: darkBrand, paddingRight: 10}}>Followers:</Text>
                    <Text style={{fontSize: 24}}>{this.props.followers.count()}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={this.showUserList(this.props.followings, 'followingID')}
                    style={{flex: 2, paddingLeft: 5, flexDirection: 'row', alignItems: 'center'}}
                  >
                    <Text style={{color: darkBrand, paddingRight: 10}}>Following:</Text>
                    <Text style={{fontSize: 24}}>{this.props.followings.count()}</Text>
                  </TouchableOpacity>
                <View style={{flex: 1}} />
              </View>
            </CardItem>
          </Card>

          <Card>
            <CardItem header style={{padding: 5}}>
              <View style={{paddingLeft: 5}}>
                <TouchableWithoutFeedback onPress={this.maybeShowID}>
                  <View>
                    <Text style={{color: darkBrand}}>Name</Text>
                  </View>
                </TouchableWithoutFeedback>
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
  profileButton: {
    width: 130,
    paddingTop: 2,
  },
  unfollowButton:{
    marginRight:20,
    marginLeft:20,
    marginTop:10,
    paddingTop:10,
    paddingBottom:10,
    backgroundColor: danger ,
    borderRadius:10,
    borderWidth: 1,
    borderColor: '#fff'
  },
  followButton:{
    marginRight:40,
    marginLeft:40,
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
