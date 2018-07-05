import React, { Component } from 'react';
import {
  Button,
  Picker,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Container, Content } from 'native-base';
import ImagePicker from 'react-native-image-crop-picker'

import PhotosByTimestamp from '../PhotosByTimestamp'

export default class RideDetails extends Component {
  constructor (props) {
    super(props)
    this.renderHorses = this.renderHorses.bind(this)
    this.uploadPhoto = this.uploadPhoto.bind(this)
  }

  uploadPhoto() {
    ImagePicker.openPicker({
      width: 1080,
      height: 1080,
      cropping: true
    }).then(image => {
      this.props.uploadPhoto(image.path)
    }).catch((e) => {})
  }


  renderHorses () {
    const horseComps = []
    for (let horse of this.props.horses) {
      horseComps.push(
        <Picker.Item
          key={horse._id}
          label={horse.name}
          value={horse._id}
        />
      )
    }
    horseComps.push(
      <Picker.Item
        key={null}
        label={'None'}
        value={null}
      />
    )
    return (
      <Picker
        selectedValue={this.props.horseSelected ? this.props.horseID : this.props.horses[0]._id}
        onValueChange={this.props.changeHorseID}
      >
        {horseComps}
      </Picker>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Ride Name:</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={this.props.changeRideName}
          selectTextOnFocus={true}
          value={this.props.rideName}
        />
        <Text>Horse:</Text>
        {this.renderHorses()}
        <View style={styles.profileButton}>
          <Button onPress={this.uploadPhoto} title='Add Photo' />
        </View>
        <Container>
          <Content>
            <Text>Photos</Text>
            <PhotosByTimestamp
              photosByID={this.props.photosByID}
              profilePhotoID={this.props.profilePhotoID}
            />
          </Content>
        </Container>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  saveButton: {
    padding: 100
  },
  buttons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonPad: {
    margin: 20
  },
  profileButton: {
    width: 130,
    paddingTop: 2,
  },

});
