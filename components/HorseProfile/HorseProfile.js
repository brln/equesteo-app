import React, { PureComponent } from 'react';
import ImagePicker from 'react-native-image-crop-picker'
import {
  Card,
  CardItem,
  Fab,
} from 'native-base';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import BuildImage from '../Images/BuildImage'
import { userName } from '../../modelHelpers/user'
import { brand, darkBrand } from '../../colors'
import { MONTHS } from '../../helpers'
import RidersCard from './RidersCard'
import FabImage from '../FabImage'
import TrainingCard from './TrainingCard'
import Stat from '../Stat'
import PhotoFilmstrip from "../Ride/PhotoFilmstrip"
import SquaresCard from '../Profile/SquaresCard'
import MedImage from '../Images/MedImage'
import Amplitude, {
  ADD_HORSE_PHOTO_TO_OTHERS_HORSE,
  ADD_HORSE_PHOTO_TO_OWN_HORSE,
} from '../../services/Amplitude'
import EqText from '../Shared/EqText'

const { height } = Dimensions.get('window')


export default class HorseProfile extends PureComponent {
  constructor (props) {
    super(props)
    this.makeBirthday = this.makeBirthday.bind(this)
    this.photoSources = this.photoSources.bind(this)
    this.renderOwner = this.renderOwner.bind(this)
    this.renderImageSwiper = this.renderImageSwiper.bind(this)
    this.showRiderProfile = this.showRiderProfile.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)
  }

  showRiderProfile (rider) {
    return () => {
      this.props.showRiderProfile(rider)
    }
  }

  uploadPhoto () {
    ImagePicker.openPicker({
      width: 1080,
      height: 1080,
      cropping: true
    }).then(image => {
      if (this.props.horseOwner && this.props.horseOwner !== this.props.user) {
        Amplitude.logEvent(ADD_HORSE_PHOTO_TO_OTHERS_HORSE)
      } else {
        Amplitude.logEvent(ADD_HORSE_PHOTO_TO_OWN_HORSE)
      }
      this.props.uploadPhoto(image.path)
    }).catch(e => {
      if (e.code && e.code === 'E_PERMISSION_MISSING') {
        Alert.alert('Denied', 'You denied permission to access photos. Please enable via permissions settings for Equesteo.')
      } else {
        this.props.logError(e, 'HorseProfile.uploadPhoto')
      }
    })
  }

  makeBirthday () {
    const horse = this.props.horse
    const birthMonth = horse.get('birthMonth')
    const birthDay = horse.get('birthDay')
    const birthYear = horse.get('birthYear')
    if (birthMonth && birthDay && birthYear) {
      return `${MONTHS[birthMonth]} ${birthDay} ${birthYear}`
    } else if (birthMonth && birthYear) {
      return `${MONTHS[birthMonth]} ${birthYear}`
    } else if (birthMonth && birthDay) {
      return `${MONTHS[birthMonth]} ${birthDay}`
    } else if (birthYear) {
      return `${birthYear}`
    }
    else return 'unknown'
  }

  makeHeight () {
    const horse = this.props.horse
    const heightHands = horse.get('heightHands')
    const heightInches = horse.get('heightInches')
    if (heightHands && heightInches) {
       return `${heightHands}.${heightInches} hh`
    } else if (heightHands) {
      return `${heightHands} hh`
    } else return 'unknown'
  }

  photoSources (selectedID) {
    let selectedSource = null
    const sources = this.props.horsePhotos.reduce((accum, photo, photoID) => {
      if (photoID !== selectedID) {
        accum.push({url: photo.get('uri')})
      } else {
        selectedSource = {url: photo.get('uri')}
      }
      return accum
    }, [])
    sources.unshift(selectedSource)
    return sources
  }

  renderProfileImage () {
    const images = []
    const horse = this.props.horse
    const nameText = (
      <View style={{position: 'absolute', bottom: 30, left: 10}}>
        <Text style={styles.nameText}>
          {this.props.horse.get('name') || 'No Name'}
        </Text>
      </View>
    )
    if (horse.get('profilePhotoID')) {
      const profileSource = {uri: this.props.horsePhotos.getIn([horse.get('profilePhotoID'), 'uri'])}
      const swiperSources = this.photoSources(horse.get('profilePhotoID'))
      images.push(
        <MedImage
          key={"profile"}
          onPress={() => this.props.showPhotoLightbox(swiperSources)}
          style={{width: '100%', height: '100%'}}
          source={profileSource}
          onError={() => this.props.logInfo("Can't load HorseProfile image: " + profileSource.uri)}
          showSource={true}
        >
          { nameText }
        </MedImage>
      )
    } else {
      images.push(
        <View style={styles.slide} key={"empty"}>
          <BuildImage
            style={{width: '100%', height: '100%'}}
            source={require('../../img/emptyHorse.png')}
            onError={() => this.props.logInfo("Can't load Empty Horse Profile image")}
          />
          { nameText }
        </View>
      )
    }
    return images
  }

  renderImageSwiper () {
    return (
      <View>
        <View style={{
          height: ((height / 2) - 20),
          borderBottomColor: this.props.horse.get('color') || null,
          borderBottomWidth: this.props.horse.get('color') ? 3 : null
        }}>
          {this.renderProfileImage()}
          { this.props.owner ? <Fab
            direction="up"
            style={{ backgroundColor: brand }}
            position="bottomRight"
            onPress={this.uploadPhoto}>
            <FabImage source={require('../../img/addphoto.png')} height={30} width={30} />
          </Fab> : null }
        </View>
        <PhotoFilmstrip
          photosByID={this.props.horsePhotos}
          showPhotoLightbox={this.props.showPhotoLightbox}
          exclude={[this.props.horse.get('profilePhotoID')]}
        />
      </View>
    )
  }

  renderOwner () {
    let ownerSection = null
    if (this.props.horseOwner && this.props.horseOwner !== this.props.user) {
       ownerSection = (
        <View>
        <CardItem header style={{padding: 5}}>
          <View style={{paddingLeft: 5}}>
            <Text style={{color: darkBrand}}>Owner</Text>
          </View>
        </CardItem>
        <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20}}>
          <EqText>{ userName(this.props.horseOwner) }</EqText>
        </CardItem>
        </View>
      )
    }
    return ownerSection
  }

  render() {
    return (
      <ScrollView>
        {this.renderImageSwiper()}

        <SquaresCard
          trainings={this.props.trainings}
          visible={true}
        />

        <TrainingCard
          trainings={this.props.trainings}
          visible={true}
        />

        <View style={{flex: 1}}>
          <Card>
            { this.renderOwner() }
            <CardItem header style={{padding: 5}}>
              <View style={{paddingLeft: 5}}>
                <Text style={{color: darkBrand}}>Description</Text>
              </View>
            </CardItem>
            <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20}}>
              <EqText>{this.props.horse.get('description') || 'nothing'}</EqText>
            </CardItem>
          </Card>

          <Card style={{flex: 1}}>
            <CardItem header style={{padding: 5}}>
              <View style={{paddingLeft: 5}}>
                <Text style={{color: darkBrand}}>Info</Text>
              </View>
            </CardItem>
            <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20, flex: 1}}>
              <View style={{flex: 1}}>
                <View style={{flex: 1, flexDirection: 'row', paddingBottom: 10}}>
                  <Stat
                    imgSrc={require('../../img/birthday.png')}
                    text={'Birthday'}
                    value={this.makeBirthday()}
                  />
                  <Stat
                    imgSrc={require('../../img/breed.png')}
                    text={'Breed'}
                    value={this.props.horse.get('breed') || 'none'}
                  />
                </View>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Stat
                    imgSrc={require('../../img/height.png')}
                    text={'Height'}
                    value={this.makeHeight()}
                  />
                  <Stat
                    imgSrc={require('../../img/type.png')}
                    text={'Sex'}
                    value={this.props.horse.get('sex') || 'none'}
                  />
                </View>
              </View>
            </CardItem>
          </Card>
          { this.props.owner ? <RidersCard
              addRider={this.props.addRider}
              deleteHorse={this.props.deleteHorse}
              riders={this.props.riders}
              showRiderProfile={this.showRiderProfile}
              user={this.props.user}
              userPhotos={this.props.userPhotos}
            /> : null }
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  nameText: {
    fontSize: 25,
    color: 'white',
    fontFamily: 'Montserrat-Regular',
    textShadowColor: 'black',
    textShadowRadius: 7,
    textShadowOffset: {width: 2, height: 1}
  }
});
