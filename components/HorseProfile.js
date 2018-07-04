import React, { Component } from 'react';
import {
  Card,
  CardItem,
} from 'native-base';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { darkBrand } from '../colors'

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


export default class HorseProfile extends Component {
  constructor (props) {
    super(props)
    this.makeBirthday = this.makeBirthday.bind(this)
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
    let source
    if (this.props.horse.profilePhotoID && this.props.horse.photosByID[this.props.horse.profilePhotoID]) {
      uri = this.props.horse.photosByID[this.props.horse.profilePhotoID].uri
    }
    if (this.props.user.profilePhotoID) {
      source = { uri }
    }
    const imageHeight = Math.round(height * 2 / 5)
    return (
      <ScrollView>
        <View style={{flex: 1}}>
          <View style={{flex: 2, width}}>
            <Image style={{width, height: imageHeight }} source={source} />
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
