import React, { Component } from 'react';
import ImagePicker from 'react-native-image-crop-picker'
import {
  CameraRoll,
  Dimensions,
  ImageEditor,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { RNCamera } from 'react-native-camera';

import BuildImage from './Images/BuildImage'
import URIImage from './Images/URIImage'
import { logError } from '../helpers'
import Amplitude, { TAKE_GEOTAGGED_PHOTO } from "../services/Amplitude"

const { width } = Dimensions.get('window');


export default class Camera extends Component {
  constructor (props) {
    super(props)
    this.state = {
      backCamera: true
    }
    this.changeCameraType = this.changeCameraType.bind(this)
    this.takePicture = this.takePicture.bind(this)
  }

  changeCameraType () {
    this.setState({
      backCamera: !this.state.backCamera
    })
  }

  takePicture () {
    if (this.camera) {
      Amplitude.logEvent(TAKE_GEOTAGGED_PHOTO)
      let tempURI
      this.camera.takePictureAsync({
        fixOrientation: true,
        pauseAfterCapture: true,
        forceUpOrientation: true,
      }).then((data) => {
        tempURI = data.uri
        return CameraRoll.saveToCameraRoll(tempURI)
      }).then((permURI) => {
        this.props.stashNewRidePhoto(permURI)
        this.camera.resumePreview()
        ImagePicker.cleanSingle(tempURI).catch(e => logError(e, 'Camera.ImagePicker.cleanSingle'))
      }).catch((e) => { logError(e, 'Camera.takePicture.takePictureAsync') })
    }
  }

  render() {
    let lastPhoto = null
    if (this.props.mostRecentPhoto) {
      lastPhoto = (
        <View style={{margin: 15}}>
          <URIImage
            resizeMode={'cover'}
            source={{uri: this.props.mostRecentPhoto.get('uri')}}
            style={{height: '100%', borderRadius: 10}}
          />
        </View>
      )
    }
    return (
      <View style={styles.container}>
        <View style={{width, height: width}}>
          { this.props.showCam ? <RNCamera
            ref={ref => { this.camera = ref }}
            style = {styles.preview}
            type={this.state.backCamera ? RNCamera.Constants.Type.back : RNCamera.Constants.Type.front}
            flashMode={RNCamera.Constants.FlashMode.off}
            captureAudio={false}
          /> : null}
        </View>
        <View style={{borderColor: 'red', borderWidth: 1, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <View style={{flex: 1, aspectRatio: 1}}>
            <TouchableOpacity onPress={this.props.showRecentPhoto}>
              { lastPhoto }
            </TouchableOpacity>
          </View>
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={this.takePicture}
              style = {styles.capture}
            >
              <BuildImage source={require('../img/camera/cameraButton.png')}/>
            </TouchableOpacity>
          </View>
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={this.changeCameraType}
            >
              <BuildImage source={require('../img/camera/cameraFlipIcon.png')}/>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#050e1b',
  },
  preview: {
    flex: 1,
    alignItems: 'center',
    height: width,
  },
})
