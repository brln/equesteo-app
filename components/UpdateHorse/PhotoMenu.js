import React, { PureComponent } from 'react';
import {
  BackHandler,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import BuildImage from '../BuildImage'

const { width } = Dimensions.get('window')

export default class PhotoMenu extends PureComponent {
  constructor (props) {
    super(props)
    this.handleBackPress = this.handleBackPress.bind(this)
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleBackPress () {
    this.props.clearPhotoMenu()
    return true
  }

  render() {
    return (
      <TouchableWithoutFeedback style={{width: '100%', height: '100%'}}>
        <View style={styles.modalBackground}>
          <View style={{position: 'absolute', bottom: 0, height: 150, width, backgroundColor: 'white', elevation: 20}}>
            <View style={{flex: 1}}>
              <TouchableOpacity style={{flex: 1, paddingTop: 20}} onPress={this.props.changeProfilePhotoID}>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                  <View style={{flex: 1}}>
                    <BuildImage
                      source={require('../../img/selectImage.png')}
                      style={{flex: 1, height: null, width: null, resizeMode: 'contain'}}
                    />
                  </View>
                  <View style={{flex: 3}}>
                    <Text style={{fontSize: 20}}>Set as Profile Photo</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={{flex: 1, paddingTop: 20, paddingBottom: 20}} onPress={this.props.deletePhoto}>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                  <View style={{flex: 1}}>
                    <BuildImage
                      source={require('../../img/deleteImage.png')}
                      style={{flex: 1, height: null, width: null, resizeMode: 'contain'}}
                    />
                  </View>
                  <View style={{flex: 3}}>
                    <Text style={{fontSize: 20}}>Delete Photo</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(52, 52, 52, 0.8)'
  }
});
