import React, { Component } from 'react';
import ImagePicker from 'react-native-image-crop-picker'
import {
  Card,
  CardItem,
  Fab,
} from 'native-base';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Swiper from 'react-native-swiper';

import { brand } from '../colors'
import DeleteModal from './DeleteModal'
import SwipablePhoto from './SwipablePhoto'
import FabImage from './FabImage'

const { height } = Dimensions.get('window')

function Stat (props) {
  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
        <View style={{flex: 1, paddingRight: 10}}>
          <Image source={props.imgSrc} style={{flex: 1, height: null, width: null, resizeMode: 'contain'}}/>
        </View>
        <View style={{flex: 3}}>
          <View style={{paddingBottom: 3}}>
            <Text>{props.text}</Text>
          </View>
          <Text style={{fontSize: 20, fontWeight: 'bold'}}>{props.value}</Text>
        </View>
      </View>
    </View>
  )
}

export default class HorseProfile extends Component {
  constructor (props) {
    super(props)
    this.makeBirthday = this.makeBirthday.bind(this)
    this.renderImageSwiper = this.renderImageSwiper.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)
  }

  uploadPhoto () {
    ImagePicker.openPicker({
      width: 1080,
      height: 1080,
      cropping: true
    }).then(image => {
      this.props.uploadPhoto(image.path)
    }).catch(() => {});
  }

  makeBirthday () {
    const horse = this.props.horse
    if (horse.birthMonth && horse.birthDay && horse.birthYear) {
      return `${horse.birthMonth}-${horse.birthDay}-${horse.birthYear}`
    } else if (horse.birthMonth && horse.birthYear) {
      return `${horse.birthMonth}-${horse.birthYear}`
    }
    else return 'unknown'
  }

  makeHeight () {
    const horse = this.props.horse
    if (horse.heightHands && horse.heightInches) {
       return `${horse.heightHands}.${horse.heightInches} hh`
    } else if (horse.heightHands) {
      return `${horse.heightHands} hh`
    } else return 'unknown'

  }

  renderImages () {
    const images = []
    if (Object.keys(this.props.horse.photosByID).length > 0) {
      images.push(
        <SwipablePhoto
          key="profile"
          source={{uri: this.props.horse.photosByID[this.props.horse.profilePhotoID].uri}}
          navigator={this.props.navigator}
        />
      )
      for (let imageID of Object.keys(this.props.horse.photosByID)) {
        if (imageID !== this.props.horse.profilePhotoID) {
          images.push(
            <SwipablePhoto
              key={imageID}
              source={{uri: this.props.horse.photosByID[imageID].uri}}
              navigator={this.props.navigator}
            />
          )
        }
      }
    } else {
      images.push(
        <SwipablePhoto key="empty" source={require('../img/emptyHorse.png')} />
      )
    }
    return images
  }

  renderImageSwiper () {
    let fab
    if (this.props.horse.userID === this.props.user._id) {
      fab = (
        <Fab
          direction="up"
          style={{ backgroundColor: brand }}
          position="bottomRight"
          onPress={this.uploadPhoto}>
            <FabImage source={require('../img/addphoto.png')} height={30} width={30} />
        </Fab>
      )
    }
    return (
      <View style={{height: ((height / 2) - 20)}}>
        <Swiper loop={false} showsPagination={false}>
          {this.renderImages()}
        </Swiper>
        { fab }
      </View>
    )
  }

  render() {
    return (
      <ScrollView>
        <DeleteModal
          modalOpen={this.props.modalOpen}
          closeDeleteModal={this.props.closeDeleteModal}
          deleteFunc={this.props.deleteHorse}
          text={"Are you sure you want to delete this horse?"}
        />
        {this.renderImageSwiper()}
        <View style={{height: height / 3}}>
          <Card style={{flex: 1}}>
            <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20, flex: 1}}>
              <View style={{flex: 1, paddingTop: 20}}>
                <View style={{flex: 1, flexDirection: 'row', paddingBottom: 10}}>
                  <Stat
                    imgSrc={require('../img/birthday.png')}
                    text={'Birthday'}
                    value={this.makeBirthday()}
                  />
                  <Stat
                    imgSrc={require('../img/breed.png')}
                    text={'Breed'}
                  />
                </View>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Stat
                    imgSrc={require('../img/height.png')}
                    text={'Height'}
                    value={this.makeHeight()}
                  />
                  <Stat
                    imgSrc={require('../img/type.png')}
                    text={'Type'}
                  />
                </View>
              </View>
            </CardItem>
          </Card>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({});
