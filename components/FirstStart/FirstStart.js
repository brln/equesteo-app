import React, { PureComponent } from 'react'
import {
  Dimensions,
  View
} from 'react-native'

import BuildImage from '../BuildImage'
import { logRender } from '../../helpers'
import FinalPage from './FinalPage'
import FirstHorsePage from './FirstHorsePage'
import FirstHorsePhoto from './FirstHorsePhoto'
import IntroPage from './IntroPage'
import NamePage from './NamePage'
import ProfilePhotoPage from './ProfilePhotoPage'


const { height, width } = Dimensions.get('window')

export default class FirstStart extends PureComponent {
  constructor () {
    super()
    this.pickPage = this.pickPage.bind(this)
    this.inputs = {}
  }

  pickPage () {
    switch (this.props.currentPage) {
      case this.props.pages.INTRO_PAGE.name:
        return (
          <IntroPage
            nextPage={this.props.nextPage}
          />
        )
      case this.props.pages.NAME_PAGE.name:
        return (
          <NamePage
            commitUpdateUser={this.props.commitUpdateUser}
            inputs={this.inputs}
            nextPage={this.props.nextPage}
            updateUser={this.props.updateUser}
            user={this.props.user}
          />
        )
      case this.props.pages.PROFILE_PHOTO.name:
        return (
          <ProfilePhotoPage
            inputs={this.inputs}
            changePersonalData={this.changePersonalData}
            nextPage={this.props.nextPage}
            uploadProfilePhoto={this.props.uploadProfilePhoto}
            user={this.props.user}
          />
        )
      case this.props.pages.FIRST_HORSE.name:
        return (
          <FirstHorsePage
            horse={this.props.horse}
            inputs={this.inputs}
            changePersonalData={this.changePersonalData}
            newHorse={this.props.newHorse}
            nextPage={this.props.nextPage}
            pages={this.props.pages}
            setSkip={this.props.setSkip}
            updateHorse={this.props.updateHorse}
          />
        )
      case this.props.pages.FIRST_HORSE_PHOTO.name:
        return (
          <FirstHorsePhoto
            addHorseProfilePhoto={this.props.addHorseProfilePhoto}
            createHorse={this.props.createHorse}
            horse={this.props.horse}
            inputs={this.inputs}
            nextPage={this.props.nextPage}
          />
        )
      case this.props.pages.FINAL_PAGE.name:
        return (
          <FinalPage
            done={this.props.done}
          />
        )
    }
  }

  render() {
    logRender('FirstStart')
    return (
      <View>
        <View style={{height: height - 56, position: 'absolute'}}>
          <View style={{flex: 1, justifyContent: 'space-between'}}>
            <View style={{
              alignItems: 'center',
              flexDirection: 'column',
              backgroundColor: 'white',
              flex: 2,
              paddingTop: 20
            }}>
              <BuildImage
                source={require('../../img/logo250.png')}
                style={{
                  width: 60,
                  height: 60,
                  alignItems: 'center',

                }}
              />
            </View>
            <View style={{flex: 3, justifyContent: 'flex-end', backgroundColor: 'white'}}>
              <BuildImage
                source={require('../../img/firstStart.jpg')}
                style={{
                  width,
                  height: width,
                  resizeMode: 'cover',
                }}
              />
            </View>
          </View>
        </View>
        <View style={{paddingTop: 90, height: '100%', backgroundColor: 'transparent'}}>
          {this.pickPage()}
        </View>
      </View>
    )
  }
}

