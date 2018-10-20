import React, { PureComponent } from 'react';
import ImagePicker from 'react-native-image-crop-picker'
import {
  Card,
  CardItem,
  Fab,
} from 'native-base';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import BuildImage from '../BuildImage'
import { brand, darkBrand } from '../../colors'
import { logError } from '../../helpers'
import DeleteModal from '../Shared/DeleteModal'
import RidersCard from './RidersCard'
import FabImage from '../FabImage'
import TrainingCard from './TrainingCard'
import Stat from '../Stat'
import PhotoFilmstrip from "../Ride/PhotoFilmstrip"
import URIImage from '../URIImage'

const { height } = Dimensions.get('window')


export default class HorseProfile extends PureComponent {
  constructor (props) {
    super(props)
    this.makeBirthday = this.makeBirthday.bind(this)
    this.renderOwner = this.renderOwner.bind(this)
    this.renderDeleteModal = this.renderDeleteModal.bind(this)
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
      this.props.uploadPhoto(image.path)
    }).catch(() => {})
  }

  makeBirthday () {
    const horse = this.props.horse
    const birthMonth = horse.get('birthMonth')
    const birthDay = horse.get('birthDay')
    const birthYear = horse.get('birthYear')
    if (birthMonth && birthDay && birthYear) {
      return `${birthMonth}-${birthDay}-${birthYear}`
    } else if (birthMonth && birthYear) {
      return `${birthMonth}-${birthYear}`
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

      const profileSource = {uri: horse.getIn(['photosByID', horse.get('profilePhotoID'), 'uri'])}
      images.push(
        <TouchableOpacity
          key={"profile"}
          style={styles.slide}
          onPress={() => this.props.showPhotoLightbox(profileSource)}
        >
          <URIImage
            style={{width: '100%', height: '100%'}}
            source={profileSource}
            onError={e => logError("Can't load HorseProfile image")}
            showSource={true}
          />
          { nameText }
        </TouchableOpacity>
      )
    } else {
      images.push(
        <View style={styles.slide} key={"empty"}>
          <BuildImage
            style={{width: '100%', height: '100%'}}
            source={require('../../img/emptyHorse.png')}
            onError={e => logError("Can't load Empty Horse Profile image")}
          />
          { nameText }
        </View>
      )
    }
    return images
  }

  renderImageSwiper () {
    let fab
    if (this.props.horseOwner === this.props.user) {
      fab = (
        <Fab
          direction="up"
          style={{ backgroundColor: brand }}
          position="bottomRight"
          onPress={this.uploadPhoto}>
            <FabImage source={require('../../img/addphoto.png')} height={30} width={30} />
        </Fab>
      )
    }
    return (
      <View>
        <View style={{height: ((height / 2) - 20)}}>
          {this.renderProfileImage()}
          { fab }
        </View>
        <PhotoFilmstrip
          photosByID={this.props.horse.get('photosByID')}
          showPhotoLightbox={this.props.showPhotoLightbox}
          exclude={[this.props.horse.get('profilePhotoID')]}
        />
      </View>
    )
  }

  renderOwner () {
    let ownerSection = null
    if (this.props.horseOwner !== this.props.user) {
       ownerSection = (
        <View>
        <CardItem header style={{padding: 5}}>
          <View style={{paddingLeft: 5}}>
            <Text style={{color: darkBrand}}>Owner</Text>
          </View>
        </CardItem>
        <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20}}>
          <Text>
            {`${this.props.horseOwner.get('firstName') || ''} ${this.props.horseOwner.get('lastName') || ''}`}
            </Text>
        </CardItem>
        </View>
      )
    }
    return ownerSection
  }

  renderDeleteModal () {
    let text = "Are you sure you want to archive this horse?"
    if (this.props.horseOwner !== this.props.user) {
      text = "Are you sure you want to remove this horse from your barn? It will not be deleted from the owner's barn."
    }
    return (
       <DeleteModal
        modalOpen={this.props.modalOpen}
        closeDeleteModal={this.props.closeDeleteModal}
        deleteFunc={this.props.deleteHorse}
        text={text}
      />
    )
  }

  render() {
    return (
      <ScrollView>
        {this.renderDeleteModal()}
        {this.renderImageSwiper()}
        <View style={{flex: 1}}>
          <Card>
            { this.renderOwner() }
            <CardItem header style={{padding: 5}}>
              <View style={{paddingLeft: 5}}>
                <Text style={{color: darkBrand}}>Description</Text>
              </View>
            </CardItem>
            <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20}}>
              <Text>{this.props.horse.get('description') || 'nothing'}</Text>
            </CardItem>
          </Card>

          <Card style={{flex: 1}}>
            <CardItem header style={{padding: 5}}>
              <View style={{paddingLeft: 5}}>
                <Text style={{color: darkBrand}}>Info</Text>
              </View>
            </CardItem>
            <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20, flex: 1}}>
              <View style={{flex: 1, paddingTop: 20}}>
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
          <TrainingCard
            rides={this.props.rides}
          />
          <RidersCard
            addRider={this.props.addRider}
            riders={this.props.riders}
            showRiderProfile={this.showRiderProfile}
            user={this.props.user}
          />
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
