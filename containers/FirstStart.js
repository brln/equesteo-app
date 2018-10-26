import { Map } from 'immutable'
import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';

import { createHorse, updateUser, uploadProfilePhoto } from '../actions'
import { brand } from '../colors'
import { generateUUID, logRender, unixTimeNow } from '../helpers'
import FirstStart from '../components/FirstStart/FirstStart'

class FirstStartContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        leftButtons: [
          {
            id: 'back',
            icon: require('../img/back-arrow.png'),
            color: 'white'
          }
        ],
        elevation: 0
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
    this.pages = {
      INTRO_PAGE: {name: 'INTRO_PAGE', i: 1},
      NAME_PAGE: {name: 'NAME_PAGE', i: 2},
      PROFILE_PHOTO: {name: 'PROFILE_PHOTO', i: 3},
      FIRST_HORSE: {name: 'FIRST_HORSE', i: 4},
      FIRST_HORSE_PHOTO: {name: 'FIRST_HORSE_PHOTO', i: 5},
      FINAL_PAGE: {name: 'FINAL_PAGE', i: 6}
    }
    this.state = {
      currentPage: this.pages.INTRO_PAGE.name,
      skipPages: [],
      user: props.user,
      horse: Map({
        _id: `${props.userID.toString()}_${(new Date).getTime().toString()}`,
        userID: props.userID,
        photosByID: Map()
      }),
      horseEdited: false
    }
    this.addHorseProfilePhoto = this.addHorseProfilePhoto.bind(this)
    this.commitUpdateUser = this.commitUpdateUser.bind(this)
    this.createHorse = this.createHorse.bind(this)
    this.done = this.done.bind(this)
    this.nextPage = this.nextPage.bind(this)
    this.prevPage = this.prevPage.bind(this)
    this.setSkip = this.setSkip.bind(this)
    this.skipHorsePhoto = this.skipHorsePhoto.bind(this)
    this.updateHorse = this.updateHorse.bind(this)
    this.updateUser = this.updateUser.bind(this)
    this.uploadProfilePhoto = this.uploadProfilePhoto.bind(this)
    Navigation.events().bindComponent(this);
  }

  static getDerivedStateFromProps (props, state) {
    let nextState = null
    if (!state.user || (props.user && props.user.get('_rev') !== state.user.get('_rev'))) {
      nextState = {
        user: props.user,
      }
    }
    return nextState
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'back') {
      if (this.pages[this.state.currentPage].i === 1) {
        Navigation.pop(this.props.componentId)
      } else {
        this.prevPage()
      }
    }
  }

  createHorse () {
    this.props.dispatch(createHorse(this.state.horse))
  }

  updateUser (newUser) {
    this.setState({
      user: newUser
    })
  }

  updateHorse (newHorse) {
    this.setState({
      horse: newHorse,
      horseEdited: true
    })
  }

  uploadProfilePhoto (location) {
    this.props.dispatch(uploadProfilePhoto(location))
  }

  commitUpdateUser () {
    this.props.dispatch(updateUser(this.state.user))
  }

  addHorseProfilePhoto (uri) {
    let timestamp = unixTimeNow()
    let photoID = generateUUID()
    let horse = this.state.horse.set('profilePhotoID', photoID)
    horse = horse.setIn(['photosByID', photoID], Map({timestamp, uri}))
    this.setState({
      horse
    })
  }

  done () {
    this.props.dispatch(updateUser(this.props.user.set('finishedFirstStart', true)))
    Navigation.pop(this.props.componentId)
  }

  setSkip (pageName, then) {
    this.setState({
      skipPages: [...this.state.skipPages, this.pages[pageName].i]
    }, then)
  }

  skipHorsePhoto () {
    this.nextPage()
    if (this.state.horseEdited) {
      this.createHorse()
    }
  }

  nextPage () {
    const currentIndex = this.pages[this.state.currentPage].i
    let nextIndex = currentIndex + 1
    if (this.state.skipPages.indexOf(nextIndex) > -1) {
      nextIndex += 1
    }
    for (let pageData of Object.values(this.pages)) {
      if (pageData.i === nextIndex) {
        this.setState({
          currentPage: pageData.name
        })
        break
      }
    }
  }

  prevPage () {
    const currentIndex = this.pages[this.state.currentPage].i
    let nextIndex = currentIndex - 1
    if (this.state.skipPages.indexOf(nextIndex) > -1) {
      nextIndex -= 1
    }
    for (let pageData of Object.values(this.pages)) {
      if (pageData.i === nextIndex) {
        this.setState({
          currentPage: pageData.name,
          skipPages: this.state.skipPages.filter(x => x < nextIndex)
        })
      }
    }
  }

  render() {
    logRender('FirstStartContainer')
    return <FirstStart
      addHorseProfilePhoto={this.addHorseProfilePhoto}
      commitUpdateUser={this.commitUpdateUser}
      createHorse={this.createHorse}
      currentPage={this.state.currentPage}
      done={this.done}
      horse={this.state.horse}
      nextPage={this.nextPage}
      pages={this.pages}
      setSkip={this.setSkip}
      skipHorsePhoto={this.skipHorsePhoto}
      updateHorse={this.updateHorse.bind(this)}
      updateUser={this.updateUser}
      uploadProfilePhoto={this.uploadProfilePhoto}
      user={this.state.user}
    />
  }
}

function mapStateToProps (state) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  return {
    user: pouchState.getIn(['users', localState.get('userID')]),
    userID: localState.get('userID')
  }
}
export default connect(mapStateToProps)(FirstStartContainer)
