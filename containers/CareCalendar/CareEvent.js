import { fromJS, Map } from 'immutable'
import memoizeOne from 'memoize-one'
import moment from 'moment'
import {
  Card,
  CardItem,
} from 'native-base'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import React, { Component } from 'react'
import {
  Dimensions,
  FlatList,
  Keyboard,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'

import { brand, darkBrand, darkGrey, lightGrey } from '../../colors'

import BuildImage from '../../components/Images/BuildImage'
import EqNavigation from '../../services/EqNavigation'
import { EVENT_TOOLS } from '../../screens/care'
import { HORSE_PROFILE } from '../../screens/main'
import Thumbnail from '../../components/Images/Thumbnail'
import { eventDetails } from "../../modelHelpers/careEvent"
import { userName } from '../../modelHelpers/user'

const { width, height } = Dimensions.get('window')

class CareEvent extends Component {
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
            id: 'tools',
            text: 'Tools',
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
    this.eventTime = this.eventTime.bind(this)

    this.memoHorses = memoizeOne(this.horses)
    this.memoHorseOwnerIDs = memoizeOne(this.horseOwnerIDs)
    this.renderHorse = this.renderHorse.bind(this)
    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed ({ buttonId }) {
    Keyboard.dismiss()
    if (buttonId === 'tools') {
      EqNavigation.push(this.props.activeComponent, {
        component: {
          name: EVENT_TOOLS,
          passProps: {
            careEventID: this.props.careEvent.get('_id'),
            popAfterDeleteCompID: this.props.popAfterDeleteCompID
          }
        }
      })
    }
  }

  showHorseProfile (horse) {
    const ownerID = this.memoHorseOwnerIDs(this.props.horseUsers).get(horse.get('_id'))
    return () => {
      EqNavigation.push(this.props.componentId, {
        component: {
          name: HORSE_PROFILE,
          title: horse.get('name'),
          passProps: {horse, ownerID},
        }
      })
    }
  }

  eventTime () {
    const t = this.props.careEvent.get('date')
    return `${moment(t).format('MMMM Do YYYY')} at ${moment(t).format('h:mm a')}`
  }

  horses (careEvent, horseCareEvents, horses) {
    const h = horseCareEvents.valueSeq().filter(hce => {
      return hce.get('careEventID') === careEvent.get('_id')
    }).map(hce => {
      return horses.get(hce.get('horseID'))
    })
    return h
  }

  horseOwnerIDs (horseUsers) {
    return horseUsers.filter(hu => {
      return hu.get('owner') === true
    }).mapEntries(([horseUserID, horseUser]) => {
      return [horseUser.get('horseID'), horseUser.get('userID')]
    })
  }

  renderHorse ({item}) {
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={{height: 80}}
          onPress={this.showHorseProfile(fromJS(item))}
        >
          <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: darkGrey, padding: 20}}>
            <View style={{flex: 1, justifyContent:'center'}}>
              <Thumbnail
                source={{uri: this.props.horsePhotos.getIn([item.profilePhotoID, 'uri'])}}
                emptySource={require('../../img/emptyHorseBlack.png')}
                empty={!item.profilePhotoID}
                height={width / 7}
                width={width/ 7}
                round={true}
              />
            </View>
            <View style={{flex: 3, justifyContent: 'center'}}>
              <Text>{`${item.name || 'No Name'}`}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  renderHorses (horses) {
    if (horses.count() > 0) {
      return (
        <View style={{flex: 1, borderTopWidth: 2, borderTopColor: lightGrey}}>
          <FlatList
            data={horses.toJS()}
            renderItem={this.renderHorse}
            keyExtractor={(i) => i._id}
            ItemSeparatorComponent={null}
          />
        </View>
      )
    }
  }

  render () {
    const details = eventDetails(this.props.careEvent.toJS())
    const notes = this.props.careEvent.getIn(['eventSpecificData', 'notes'])
    return (
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'always'}
        style={{flex: 1}}
      >
        <View style={{flex: 1}}>
          <View style={{flex: 1, flexDirection: 'row', paddingTop: 10, paddingBottom: 10}}>
            <View style={{width: 70, height: 70, paddingLeft: 5, marginRight: 10}}>
              <BuildImage
                source={details.icon}
                style={{flex: 1, resizeMode: "contain", width: null, height: null}}
              />
            </View>
            <View style={{flex: 4, paddingLeft: 10, paddingRight: 20}}>
              <View>
                <View style={{flex: 1, flexDirection: 'row', alignContent: 'space-between'}}>
                  <View style={{flex: 8}}>
                    <Text style={{fontSize: 24, color: 'black'}}>{details.title}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={this.showProfile}>
                  <Text style={{fontSize: 14}}>{ userName(this.props.careUser) }</Text>
                </TouchableOpacity>
                <Text style={{fontSize: 12, fontWeight: 'normal', color: darkGrey}}>{this.eventTime()}</Text>
              </View>
            </View>
          </View>

          { details.content && details.content !== notes ? <View style={{flex: 1}}>
            <Card>
              <CardItem header>
                <Text style={{color: darkBrand }}>Event:</Text>
              </CardItem>
              <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                <Text>{details.content}</Text>
              </CardItem>
            </Card>
          </View> : null }

          { notes? <View style={{flex: 1}}>
            <Card>
              <CardItem header>
                <Text style={{color: darkBrand }}>Notes:</Text>
              </CardItem>
              <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
                <Text>{notes}</Text>
              </CardItem>
            </Card>
          </View> : null }

          <Card>
            <CardItem header style={{padding: 5}}>
              <View style={{paddingLeft: 5}}>
                <Text style={{color: darkBrand}}>Horses</Text>
              </View>
            </CardItem>
            <CardItem cardBody>
              {this.renderHorses(this.memoHorses(this.props.careEvent, this.props.horseCareEvents, this.props.horses))}
            </CardItem>
          </Card>


        </View>
      </KeyboardAwareScrollView>
    )
  }
}

function mapStateToProps (state, passedProps) {
  const localState = state.get('localState')
  const activeComponent = localState.get('activeComponent')
  const pouchState = state.get('pouchRecords')
  const careEvent = pouchState.getIn(['careEvents', passedProps.careEventID])
  return {
    activeComponent,
    careEvent,
    careUser: pouchState.getIn(['users', careEvent.get('userID')]),
    horseCareEvents: pouchState.get('horseCareEvents'),
    horsePhotos: pouchState.get('horsePhotos'),
    horseUsers: pouchState.get('horseUsers'),
    horses: pouchState.get('horses'),
    popAfterDeleteCompID: passedProps.popAfterDeleteCompID,
    userID: localState.get('userID')
  }
}

export default  connect(mapStateToProps)(CareEvent)
