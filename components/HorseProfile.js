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

import { brand } from '../colors'
import DeleteModal from './DeleteModal'

const { width, height } = Dimensions.get('window')

function Stat (props) {
  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1, flexDirection: 'row'}}>
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

function FabImage (props) {
  return (
    <Image source={props.source} style={{width: props.width, height: props.height}}/>
  )
}


export default class HorseProfile extends Component {
  constructor (props) {
    super(props)
    this.makeBirthday = this.makeBirthday.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)
  }

  uploadPhoto () {
    ImagePicker.openPicker({
      width: 800,
      height: 800,
      cropping: true
    }).then(image => {
      this.props.uploadPhoto(image.path)
    }).catch(() => {});
  }

  makeBirthday () {
    const horse = this.props.horse
    return `${horse.birthMonth}-${horse.birthDay}-${horse.birthYear}`
  }

  makeHeight () {
    const horse = this.props.horse
    return `${horse.heightHands}.${horse.heightInches} hh`
  }

  render() {
    let uri = 'https://s3.us-west-1.amazonaws.com/equesteo-horse-photos/empty.png'
    if (this.props.horse.profilePhotoID && this.props.horse.photosByID[this.props.horse.profilePhotoID]) {
      uri = this.props.horse.photosByID[this.props.horse.profilePhotoID].uri
    }

    let fab
    console.log(this.props.horse.userID)
    console.log(this.props.user._id)
    if (this.props.horse.userID === this.props.user._id) {
      fab = (
        <Fab
          direction="up"
          containerStyle={{ }}
          style={{ backgroundColor: brand }}
          position="bottomRight"
          onPress={this.uploadPhoto}>
            <FabImage source={require('../img/addphoto.png')} height={30} width={30} />
        </Fab>
      )
    }
    const imageHeight = Math.round(height * 2 / 5)
    return (
      <View>
        <DeleteModal
          modalOpen={this.props.modalOpen}
          closeDeleteModal={this.props.closeDeleteModal}
          deleteFunc={this.props.deleteHorse}
          text={"Are you sure you want to delete this horse?"}
        />
        <ScrollView>
          <View style={{flex: 1}}>
            <View style={{flex: 2, width}}>
              <Image style={{width, height: imageHeight }} source={{uri}} />
              { fab }
            </View>
            <View style={{flex: 3}}>
              <Card>
                <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20}}>
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
          </View>
        </ScrollView>
      </View>
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
