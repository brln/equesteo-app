import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import {
  ActivityIndicator,
  CameraRoll,
  Dimensions,
  Keyboard,
  ScrollView,
  Share,
  Text,
  TextInput,
  View
} from 'react-native'
import { connect } from 'react-redux'

import ApiClient from '../services/ApiClient'
import Button from '../components/Button'
import { brand, darkBrand, lightGrey } from '../colors'
import UserAPI from '../services/UserApi'
import URIImage from '../components/Images/URIImage'

const { width, height } = Dimensions.get('window')

class ShareRideContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        elevation: 0,
        title: {
          color: 'white',
          fontSize: 20,
          text: 'Share Ride'
        },
        leftButtons: [
          {
            id: 'back',
            icon: require('../img/back-arrow.png'),
            color: 'white'
          }
        ],
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'back') {
      Keyboard.dismiss()
      Navigation.pop(this.props.componentId)
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      mapURL: null,
      shareLink: null,
      loading: true,
    }

    Navigation.events().bindComponent(this);
    this.downloadMap = this.downloadMap.bind(this)
    this.shareMap = this.shareMap.bind(this)
  }

  componentDidMount () {
    UserAPI.getSharableRideImage(
      this.props.ride,
      this.props.rideCoordinates,
    ).then(resp => {
      console.log(resp)
      this.setState({
        mapURL: resp.mapURL,
        loading: false,
        shareLink: resp.shareLink,
      })
    }).catch(() => {
      this.setState({
        loading: false
      })
    })
  }

  _renderMap () {
    return (
      <ScrollView>
        <View style={{flex: 1, alignItems: 'center'}}>
          <View style={{height: 20, backgroundColor: lightGrey}} />
          <URIImage
            source={{uri: this.state.mapURL}}
            style={{ height: width, width }}
            resizeMode={'contain'}
          />
          <View style={{width: '80%', paddingTop: 20}}>
            <TextInput
              editable={false}
              style={{borderColor: darkBrand, borderWidth: 1}}
              selectTextOnFocus={true}
              underlineColorAndroid={'transparent'}
              value={this.state.shareLink}
            />
          </View>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{paddingRight: 10}}>
              <Button
                color={brand}
                onPress={this.downloadMap}
                text={'Download'}
              />
            </View>
            <View style={{paddingLeft: 10}}>
              <Button
                color={brand}
                onPress={this.shareMap}
                text={'Share'}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    )
  }

  shareMap () {
    Share.share({message: this.state.shareLink, title: 'I went for a ride on Equesteo'}).then(() => {
      logDebug('shared')
    })
  }

  downloadMap () {
    ApiClient.downloadImage(this.state.mapURL).then(url => {
      return CameraRoll.saveToCameraRoll(url)
    }).then(() => {
      console.log('done')
    }).catch(e =>
      {console.log(e)
    })
  }

  _renderLoading () {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={darkBrand} />
        <Text style={{textAlign: 'center', color: darkBrand}}>Generating sharable map...</Text>
      </View>
    )
  }

  _renderError () {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30}}>
        <Text style={{textAlign: 'center', color: darkBrand}}>Could not load map. Check your connection and try again.</Text>
      </View>
    )
  }


  render() {
    if (this.state.mapURL && !this.state.loading) {
      return this._renderMap()
    } else if (this.state.loading) {
      return this._renderLoading()
    } else {
      return this._renderError()
    }
  }
}

function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  const ride = pouchState.getIn(['rides', passedProps.rideID])
  const rideCoordinates = pouchState.get('selectedRideCoordinates')
  const rideElevations = pouchState.get('selectedRideElevations')
  return {
    ride,
    rideCarrots: pouchState.get('rideCarrots'),
    rideCoordinates,
    rideElevations,
  }
}

export default connect(mapStateToProps)(ShareRideContainer)
