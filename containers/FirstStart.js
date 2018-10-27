import { Map } from 'immutable'
import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux';

import {
  createHorse,
  deleteUnpersistedHorse,
  horseUpdated,
  persistHorse,
  persistHorseUser,
  persistUser,
  setFirstStartHorseID,
  userUpdated,
  uploadProfilePhoto
} from '../actions'
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
    this.addHorseProfilePhoto = this.addHorseProfilePhoto.bind(this)
    this.changeHorseName = this.changeHorseName.bind(this)
    this.changeHorseBreed = this.changeHorseBreed.bind(this)
    this.commitUpdateUser = this.commitUpdateUser.bind(this)
    this.createHorse = this.createHorse.bind(this)
    this.done = this.done.bind(this)
    this.nextPage = this.nextPage.bind(this)
    this.prevPage = this.prevPage.bind(this)
    this.setSkip = this.setSkip.bind(this)
    this.skipHorsePhoto = this.skipHorsePhoto.bind(this)
    this.updateUser = this.updateUser.bind(this)
    this.uploadProfilePhoto = this.uploadProfilePhoto.bind(this)

    this.state = {
      currentPage: this.pages.INTRO_PAGE.name,
      skipPages: [],
      horseID: null,
      horseUserID: null,
      horseUpdated: false,
    }
    Navigation.events().bindComponent(this);
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

  componentDidMount () {
    this.createHorse()
  }

  createHorse () {
    const horseID = `${this.props.userID.toString()}_${(new Date).getTime().toString()}`
    const horseUserID = `${this.props.userID}_${horseID}`
    this.props.dispatch(createHorse(horseID, horseUserID, this.props.userID))
    this.props.dispatch(setFirstStartHorseID(horseID))
    this.setState({
      horseID,
      horseUserID
    })
  }

  updateUser (newUser) {
    this.props.dispatch(userUpdated(newUser))
  }

  changeHorseName (horseName) {
    this.props.dispatch(horseUpdated(this.props.horse.set('name', horseName)))
    this.setState({
      horseUpdated: true
    })
  }

  changeHorseBreed (horseBreed) {
    this.props.dispatch(horseUpdated(this.props.horse.set('breed', horseBreed)))
    this.setState({
      horseUpdated: true
    })
  }

  uploadProfilePhoto (location) {
    this.props.dispatch(uploadProfilePhoto(location))
  }

  commitUpdateUser () {
    this.props.dispatch(persistUser(this.props.user.get('_id')))
  }

  addHorseProfilePhoto (uri) {
    let timestamp = unixTimeNow()
    let photoID = generateUUID()
    let horse = this.props.horse.set('profilePhotoID', photoID)
    horse = horse.setIn(['photosByID', photoID], Map({timestamp, uri}))
    this.props.dispatch(horseUpdated(horse))
    this.props.dispatch(persistHorse(horse.get('_id')))
    this.setState({
      horseUpdated: true
    })
  }

  async done () {
    this.props.dispatch(userUpdated(this.props.user.set('finishedFirstStart', true)))
    this.props.dispatch(persistUser(this.props.user.get('_id')))
    if (this.state.horseUpdated) {
      await this.props.dispatch(persistHorse(this.state.horseID))
      this.props.dispatch(persistHorseUser(this.state.horseUserID))
    } else {
      this.props.dispatch(deleteUnpersistedHorse(this.state.horseID, this.state.horseUserID))
    }
    Navigation.pop(this.props.componentId)
  }

  setSkip (pageName, then) {
    this.setState({
      skipPages: [...this.state.skipPages, this.pages[pageName].i]
    }, then)
  }

  skipHorsePhoto () {
    this.nextPage()
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
      changeHorseName={this.changeHorseName}
      changeHorseBreed={this.changeHorseBreed}
      commitUpdateUser={this.commitUpdateUser}
      createHorse={this.createHorse}
      currentPage={this.state.currentPage}
      deleteHorse={this.deleteHorse}
      done={this.done}
      horse={this.props.horse}
      nextPage={this.nextPage}
      pages={this.pages}
      setSkip={this.setSkip}
      skipHorsePhoto={this.skipHorsePhoto}
      updateUser={this.updateUser}
      uploadProfilePhoto={this.uploadProfilePhoto}
      user={this.props.user}
    />
  }
}

function mapStateToProps (state) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  const horseID = localState.get('firstStartHorseID')
  const horse = horseID ? pouchState.getIn(['horses', horseID]) : null
  return {
    horse,
    user: pouchState.getIn(['users', localState.get('userID')]),
    userID: localState.get('userID')
  }
}
export default connect(mapStateToProps)(FirstStartContainer)
