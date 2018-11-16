import React, { Component } from 'react';
import {
  PermissionsAndroid,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { CameraKitCameraScreen } from 'react-native-camera-kit';
import { Navigation } from 'react-native-navigation'


export default class Camera extends Component {
  static options() {
    return {
      topBar: {
        visible: false,
        drawBehind: true
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor () {
    super()
    this.state = {
      cameraPermission: false
    }
  }

  componentDidMount () {
    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA).then((hasPermission) => {
      if (hasPermission) {
        this.setState({
          cameraPermission: true
        })
      } else {
        this.requestCameraPermission().then((granted) => {
          logDebug('here')
          this.setState({
            cameraPermission: granted
          })
        }).catch(e => logDebug(e, 'permissions error'))
      }
    })
  }

  requestCameraPermission() {
    return new PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    ).then((granted) => {
      return granted === PermissionsAndroid.RESULTS.GRANTED
    })
  }

  close () {
    Navigation.pop(this.props.componentId)
  }

  onBottomButtonPressed(event) {
    const captureImages = JSON.stringify(event.captureImages);
    if (event.type === 'left') {
      this.close()
    }
  }

  render() {
    if (this.state.cameraPermission) {
      return (
        <View style={styles.container}>
          <CameraKitCameraScreen
            actions={{rightButtonText: 'Done', leftButtonText: 'Cancel'}}
            onBottomButtonPressed={(event) => this.onBottomButtonPressed(event)}
            flashImages={{
              on: require('../img/camera/flashOn.png'),
              off: require('../img/camera/flashOff.png'),
              auto: require('../img/camera/flashAuto.png')
            }}
            cameraFlipImage={require('../img/camera/cameraFlipIcon.png')}
            captureButtonImage={require('../img/camera/cameraButton.png')}
          />
        </View>
      );
    } else {
      return <View><Text>No permission</Text></View>
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5FCFF',
  },
})
