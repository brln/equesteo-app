import memoizeOne from 'memoize-one'
import React, { PureComponent } from 'react'
import {
  Dimensions,
  StyleSheet,
  View
} from 'react-native'
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'

import Thumbnail from '../../components/Images/Thumbnail'
import { brand, orange, darkGrey } from '../../colors'
import { createCareEvent } from '../../actions/functional'
import { addNewCareHorseID, removeNewCareHorseID } from "../../actions/standard"
import EqNavigation from '../../services/EqNavigation'

const { width } = Dimensions.get('window')

class HorsePicker extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          color: 'white',
          fontSize: 20
        },
        background: {
          color: brand,
        },
        elevation: 0,
        backButton: {
          color: 'white'
        },
        rightButtons: [
          {
            id: 'saveEvent',
            text: 'All Done',
            color: 'white'
          },
        ]
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
    this.memoizedHorses = memoizeOne(this.horses.bind(this))
    this.pickHorse = this.pickHorse.bind(this)
    this.unpickHorse = this.unpickHorse.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)

    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'saveEvent') {
      this.props.dispatch(createCareEvent())
      EqNavigation.popTo(this.props.popWhenDoneID)
    }
  }

  horses (horseUsers, horses, userID) {
    return horseUsers.valueSeq().filter((hu) => {
      return (hu.get('userID') === userID) && hu.get('deleted') !== true
    }).map((hu) => {
      return horses.get(hu.get('horseID'))
    })
  }

  pickHorse (horseID) {
    return () => {
      this.props.dispatch(addNewCareHorseID(horseID))
    }
  }

  unpickHorse (horseID) {
    return () => {
      this.props.dispatch(removeNewCareHorseID(horseID))
    }
  }

  render () {
    const usersHorses = this.memoizedHorses(this.props.horseUsers, this.props.horses, this.props.userID)

    const thumbnails = usersHorses.reduce((accum, h) => {
      let onPress = this.pickHorse(h.get('_id'))
      let isChosen = this.props.newCareHorseIDs.indexOf(h.get('_id')) > -1
      let borderColor = darkGrey
      if (isChosen) {
        borderColor = orange
        onPress = this.unpickHorse(h.get('_id'))
      }
      accum.push(
        <View key={h.get('_id')}>
          <Thumbnail
            borderColor={borderColor}
            source={{uri: this.props.horsePhotos.getIn([h.get('profilePhotoID'), 'uri'])}}
            emptySource={require('../../img/emptyHorseBlack.png')}
            empty={!h.get('profilePhotoID')}
            height={width / 3}
            width={width / 3}
            onPress={onPress}
            padding={3}
            textOverlay={h.get('name')}
          />
        </View>
      )
      return accum
    }, [])
    return (
      <View style={styles.photoContainer}>
        {thumbnails}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  photoContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
})

function mapStateToProps (state, passedProps) {
  const localState = state.get('localState')
  const pouchState = state.get('pouchRecords')
  const activeComponent = localState.get('activeComponent')
  const userID = localState.get('userID')
  return {
    activeComponent,
    popWhenDoneID: passedProps.popWhenDoneID,
    newCareEvent: localState.get('newCareEvent'),
    newCareHorseIDs: localState.get('newCareHorseIDs'),
    horses: pouchState.get('horses'),
    horsePhotos: pouchState.get('horsePhotos'),
    horseUsers: pouchState.get('horseUsers'),
    userID,
  }
}

export default  connect(mapStateToProps)(HorsePicker)
