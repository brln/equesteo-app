import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import {
  ActivityIndicator,
  CameraRoll,
  Dimensions,
  Image,
  Keyboard,
  Linking,
  PermissionsAndroid,
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
import { isAndroid, logError, logInfo } from '../helpers'
import UserAPI from '../services/UserApi'
import URIImage from '../components/Images/URIImage'

const { width } = Dimensions.get('window')

const LOADING_MESSAGE = 'Generating sharable map...'
const DOWNLOADING_MESSAGE = 'Downloading map to phone...'

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
      loadingMessage: LOADING_MESSAGE,
    }

    Navigation.events().bindComponent(this);
    this.askToDownloadMap = this.askToDownloadMap.bind(this)
    this.imageLoaded = this.imageLoaded.bind(this)
    this.downloadMap = this.downloadMap.bind(this)
    this.shareMap = this.shareMap.bind(this)
  }

  componentDidMount () {
    UserAPI.getSharableRideImage(
      this.props.ride,
      this.props.rideCoordinates,
    ).then(resp => {
      logDebug(resp, 'resp')
      this.setState({
        mapURL: resp.mapURL,
        shareLink: resp.shareLink,
      })
    }).catch(e => {
      logError(e)
      this.setState({
        loading: false
      })
    })
  }

  imageError (e) {
    logError(e)
  }

  imageLoaded () {
    this.setState({
      loading: false,
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
              style={{borderColor: darkBrand, borderWidth: 1, borderRadius: 4}}
              selectTextOnFocus={true}
              underlineColorAndroid={'transparent'}
              value={this.state.shareLink}
            />
          </View>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{paddingRight: 10}}>
              <Button
                color={brand}
                onPress={this.askToDownloadMap}
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
    Share.share({message: this.state.shareLink, title: 'I went for a ride on Equesteo'})
  }


  askToDownloadMap () {
    if (isAndroid()) {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Save to your Camera Roll',
          message: 'To download your map you must let us write to external storage',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      ).then(granted => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          this.downloadMap()
        } else {
          logInfo('Camera permission denied');
        }
      }).catch((err) => {
        throw err
      })
    } else {
      this.downloadMap()
    }
  }

  downloadMap () {
    this.setState({ loading: true, loadingMessage: DOWNLOADING_MESSAGE })
    if (isAndroid()) {
      ApiClient.downloadImage(this.state.mapURL).then(url => {
        return CameraRoll.saveToCameraRoll(`file://${url}`)
      }).then(newURI => {
        this.setState({ loading: false })
        Linking.openURL(newURI)
      }).catch(e => {
        this.setState({ loading: false })
        logError(e)
      })
    } else {
      CameraRoll.saveToCameraRoll(this.state.mapURL).then(url => {
        Linking.openURL('photos-redirect://')
      })

    }
  }

  _renderLoading () {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={darkBrand} />
        <Text style={{textAlign: 'center', color: darkBrand}}>{this.state.loadingMessage}</Text>
        {
          this.state.mapURL ?
          <Image style={{height: 1, width: 1}} source={{uri: this.state.mapURL }} onLoadEnd={this.imageLoaded} onError={this.imageError}/> :
          null
        }
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