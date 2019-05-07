import moment from 'moment'
import { List } from 'immutable'
import memoizeOne from 'memoize-one'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View
} from 'react-native'
import { Container, Tab, Tabs } from 'native-base'

import BuildImage from '../../components/Images/BuildImage'
import { brand, darkGrey } from '../../colors'
import {CARE_CALENDAR, CARE_EVENT, NEW_MAIN_EVENT_MENU} from '../../screens/care'
import { HORSE_PROFILE } from '../../screens/main'
import EqNavigation from '../../services/EqNavigation'
import EventList from '../../components/CareCalendar/EventList'
import {changeCareCalendarTab, setCareEventDate} from '../../actions/standard'
import { unixTimeNow } from '../../helpers'
import Calendar from './Calendar'

class EventListContainer extends Component {
  static options() {
    return {
      topBar: {
        title: {
          text: "Care Calendar",
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
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
    this.newFeedEventNow = this.newFeedEventNow.bind(this)
    this.openCalendar = this.openCalendar.bind(this)
    this.openEventType = this.openEventType.bind(this)
    this.renderBottomButtons = this.renderBottomButtons.bind(this)
    this.showHorseProfile = this.showHorseProfile.bind(this)
    this.onChangeTab = this.onChangeTab.bind(this)
    this.openCareEvent = this.openCareEvent.bind(this)

    this.memoHorseOwnerIDs = memoizeOne(this.horseOwnerIDs)
    this.memoYourCareEvents = memoizeOne(this.yourCareEvents)
  }

  openCareEvent (careEventID) {
    return () => {
      EqNavigation.push(this.props.componentId, {
        component: {
          name: CARE_EVENT,
          passProps: {
            careEventID,
            popAfterDeleteCompID: this.props.componentId,
          }
        }
      }).catch(() => {})
    }
  }

  openCalendar () {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: CARE_CALENDAR,
        passProps: {
          popWhenDoneID: this.props.componentId
        }
      }
    }).catch(() => {})
  }

  newFeedEventNow () {
    this.props.dispatch(setCareEventDate(unixTimeNow()))
    this.openEventType()
  }

  openEventType () {
    EqNavigation.push(this.props.activeComponent, {
      component: {
        name: NEW_MAIN_EVENT_MENU,
        passProps: {
          popWhenDoneID: this.props.componentId,
        }
      },
    }).catch(() => {})
  }

  yourCareEvents (horses, horseUsers, careEvents, horseCareEvents, userID) {
    // Get all the users horses
    const horseIDs = horseUsers.valueSeq().filter((hu) => {
      return hu.get('userID') === userID && hu.get('deleted') !== true
    }).map((hu) => {
      return hu.get('horseID')
    })

    // Get all the care events for those horses
    const hces = horseCareEvents.valueSeq().filter(hce => {
      return horseIDs.indexOf(hce.get('horseID')) >= 0
    })

    const allCareEvents = {
      past: {},
      future: {},
    }

    let foundIDs = {}
    for (let hce of hces) {
      const careEventID = hce.get('careEventID')
      foundIDs[careEventID] = true
      const careEvent = careEvents.get(careEventID).toJS()
      if (careEvent.deleted !== true) {
        let pastOrFuture = moment(careEvent.date) > moment() ? 'future' : 'past'

        if (!allCareEvents[pastOrFuture][careEventID]) {
          allCareEvents[pastOrFuture][careEventID] = {
            careEvent,
            horses: List()
          }
        }
        allCareEvents[pastOrFuture][careEventID].horses = allCareEvents[pastOrFuture][careEventID].horses.push(horses.get(hce.get('horseID')))
      }
    }

    for (let ce of careEvents.valueSeq()) {
      const careEvent = ce.toJS()
      const careEventID = careEvent._id
      if (careEvent.userID === userID && careEvent.deleted !== true && !foundIDs[careEventID]) {
        let pastOrFuture = moment(careEvent.date) > moment() ? 'future' : 'past'
        if (!allCareEvents[pastOrFuture][careEventID]) {
          allCareEvents[pastOrFuture][careEventID] = {
            careEvent: careEvent,
            horses: List()
          }
        }
      }
    }

    const toSortPast = Object.values(allCareEvents.past)
    toSortPast.sort((a, b) => {
      return b.careEvent.date - a.careEvent.date
    })
    allCareEvents.past = toSortPast

    const toSortFuture = Object.values(allCareEvents.future)
    toSortFuture.sort((a, b) => {
      return a.careEvent.date - b.careEvent.date
    })
    allCareEvents.future = toSortFuture
    return allCareEvents
  }

  showHorseProfile (horse) {
    const ownerID = this.memoHorseOwnerIDs(this.props.horseUsers).get(horse.get('_id'))
    EqNavigation.push(this.props.componentId, {
      component: {
        name: HORSE_PROFILE,
        title: horse.get('name'),
        passProps: {horse, ownerID},
      }
    }).catch(() => {})
  }

  onChangeTab (a) {
    this.props.dispatch(changeCareCalendarTab(a.i))
  }

  horseOwnerIDs (horseUsers) {
    return horseUsers.filter(hu => {
      return hu.get('owner') === true
    }).mapEntries(([horseUserID, horseUser]) => {
      return [horseUser.get('horseID'), horseUser.get('userID')]
    })
  }

  renderBottomButtons () {
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <TouchableOpacity style={styles.bottomButton} onPress={this.openCalendar}>
            <View style={{flex: 1, padding: 5, paddingLeft: 15}}>
              <BuildImage
                source={require('../../img/heavyplus.png')}
                style={{flex: 1, height: 20, width: 20, resizeMode: 'contain'}}
              />
            </View>
            <View style={{flex: 3}}>
              <Text style={{fontSize: 16, color: 'white'}}>Add Event</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton} onPress={this.newFeedEventNow}>
            <View style={{flex: 1, padding: 5, paddingLeft: 10}}>
              <BuildImage
                source={require('../../img/heavyplus.png')}
                style={{flex: 1, height: 20, width: 20, resizeMode: 'contain'}}
              />
            </View>
            <View style={{flex: 4}}>
              <Text style={{fontSize: 16, color: 'white'}}>Add Event Now</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }


  render() {
    return (
      <View style={{flex: 1}}>
        <Tabs
          locked={true}
          onChangeTab={this.onChangeTab}
          page={this.props.careCalendarTab}
          tabBarUnderlineStyle={{backgroundColor: 'white'}}
          style={{flex: 10}}
        >
          <Tab
            tabStyle={{backgroundColor: brand}}
            activeTabStyle={{backgroundColor: brand}}
            heading="Future"
            activeTextStyle={{color: 'white'}}
          >
            <View style={{flex: 8}}>
              <EventList
                careEvents={this.memoYourCareEvents(
                  this.props.horses,
                  this.props.horseUsers,
                  this.props.careEvents,
                  this.props.horseCareEvents,
                  this.props.userID
                ).future}
                horses={this.props.horses}
                horsePhotos={this.props.horsePhotos}
                openCareEvent={this.openCareEvent}
                popAfterDeleteCompID={this.props.componentId}
                showHorseProfile={this.showHorseProfile}
              />
            </View>
          </Tab>
          <Tab
            tabStyle={{backgroundColor: brand}}
            activeTabStyle={{backgroundColor: brand}}
            heading="Past"
            activeTextStyle={{color: 'white'}}
          >
            <View style={{flex: 8}}>
              <EventList
                careEvents={this.memoYourCareEvents(
                  this.props.horses,
                  this.props.horseUsers,
                  this.props.careEvents,
                  this.props.horseCareEvents,
                  this.props.userID
                ).past}
                horses={this.props.horses}
                horsePhotos={this.props.horsePhotos}
                openCareEvent={this.openCareEvent}
                showHorseProfile={this.showHorseProfile}
              />
            </View>
          </Tab>
          <Tab
            tabStyle={{backgroundColor: brand}}
            activeTabStyle={{backgroundColor: brand}}
            heading="Calendar"
            activeTextStyle={{color: 'white'}}
          >
            <Calendar
              popWhenDoneID={this.props.componentId}
              showDay={true}
            />
          </Tab>
        </Tabs>
        { this.renderBottomButtons() }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand,
    borderWidth: 1,
    borderColor: darkGrey,
    margin: 5,
    borderRadius: 3
  }
});

function mapStateToProps (state) {
  const localState = state.get('localState')
  const activeComponent = localState.get('activeComponent')
  const pouchState = state.get('pouchRecords')
  return {
    activeComponent,
    careCalendarTab: localState.get('careCalendarTab'),
    careEvents: pouchState.get('careEvents'),
    horseUsers: pouchState.get('horseUsers'),
    horses: pouchState.get('horses'),
    horsePhotos: pouchState.get('horsePhotos'),
    horseCareEvents: pouchState.get('horseCareEvents'),
    newCareEvent: localState.get('newCareEvent'),
    userID: localState.get('userID')
  }
}

export default connect(mapStateToProps)(EventListContainer)
