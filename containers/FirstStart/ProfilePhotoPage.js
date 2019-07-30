import ImagePicker from 'react-native-image-crop-picker'

import React, { PureComponent } from 'react'
import {
  Alert,
  Dimensions,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { connect } from 'react-redux'

import BuildImage from '../../components/Images/BuildImage'
import { brand } from '../../colors'
import { logInfo, logRender, logError, generateUUID, unixTimeNow } from '../../helpers'
import Button from '../../components/Button'
import MedImage from '../../components/Images/MedImage'
import {
  createUserPhoto,
  userUpdated,
} from '../../actions/standard'
import functional from '../../actions/functional'
import EqNavigation from "../../services/EqNavigation"
import { FIRST_HORSE_PAGE } from "../../screens/consts/firstStart"
import Wrapper from '../../components/FirstStart/Wrapper'

const { width } = Dimensions.get('window')

class ProfilePhotoPage extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: 'transparent',
        },
        elevation: 0,
        backButton: {
          color: brand,
        },
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor () {
    super()
    this.nextPage = this.nextPage.bind(this)
    this.uploadProfile = this.uploadProfile.bind(this)
  }

  uploadProfile () {
    ImagePicker.openPicker({
      width: 1080,
      height: 1080,
      cropping: true
    }).then(image => {
      this.uploadProfilePhoto(image.path)
    }).catch(e => {
      if (e.code && e.code === 'E_PERMISSION_MISSING') {
        Alert.alert('Denied', 'You denied permission to access photos. Please enable via permissions settings for Equesteo.')
      } else {
        logError(e, 'Containers.FirstStart.uploadProfile')
      }
    })
  }

  uploadProfilePhoto (location) {
    let photoID = generateUUID()
    let userID = this.props.user.get('_id')
    this.props.dispatch(createUserPhoto(
      userID,
      {
        _id: photoID,
        timestamp: unixTimeNow(),
        uri: location
      }
    ))
    this.props.dispatch(userUpdated(this.props.user.set('profilePhotoID', photoID)))
    this.props.dispatch(functional.persistUserWithPhoto(userID, photoID, false))
  }

  nextPage () {

    EqNavigation.push(this.props.componentId, {
      component: {
        name: FIRST_HORSE_PAGE,
      }
    }).catch(() => {})
  }

  render() {
    logRender('ProfilePhotoPage')
    let button = (
      <Button
        color={brand}
        text={"Yes!"}
        onPress={this.uploadProfile}
      />
    )
    let skip = (
      <TouchableOpacity onPress={this.nextPage} style={{paddingTop: 10}}>
        <Text style={{fontSize: 10, textAlign: 'center', textDecorationLine: 'underline'}}>No, thanks.</Text>
      </TouchableOpacity>
    )
    let profilePhoto = (
      <TouchableOpacity onPress={this.uploadProfile} >
        <BuildImage
          source={require('../../img/emptyProfile.png')}
          style={{width: '100%', height: '100%'}}
        />
      </TouchableOpacity>
    )

    if (this.props.user.get('profilePhotoID')) {
      button = (
        <Button
          color={brand}
          text={"You look great! Continue"}
          onPress={this.nextPage}
        />
      )
      skip = null
      profilePhoto = (
        <MedImage
          source={{uri: this.props.userPhotos.getIn([this.props.user.get('profilePhotoID'), 'uri'])}}
          style={{width: '100%', height: '100%'}}
          onError={e => logInfo("Can't load FirstProfilePhoto image")}
        />
      )
    }

    return (
      <Wrapper>
        <View style={{flex: 1}}>
          <View style={{paddingLeft: 20, paddingRight: 20}}>
            <Text style={{
              fontSize: 30,
              fontFamily: 'Montserrat-Regular',
              color: 'black',
              textAlign: 'center'
            }}>
              Upload a profile photo?
            </Text>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <View style={{paddingTop: 30, paddingLeft: 10, paddingRight: 10, width: width * .5, height: width * .5}}>
              <View style={{borderColor: brand, borderWidth: 5, backgroundColor: 'white'}}>
                { profilePhoto }
              </View>
            </View>
            <View style={{paddingTop: 20}}>
              { button }
              { skip }
            </View>
          </View>
        </View>
      </Wrapper>
    )
  }
}

function mapStateToProps (state, passedProps) {
  const localState = state.get('localState')
  const pouchState = state.get('pouchRecords')
  const horseID = localState.getIn(['firstStartHorseID', 'horseID'])
  return {
    horse: pouchState.getIn(['horses', horseID]),
    user: pouchState.getIn(['users', localState.get('userID')]),
    userID: localState.get('userID'),
    userPhotos: pouchState.get('userPhotos')
  }
}

export default connect(mapStateToProps)(ProfilePhotoPage)
