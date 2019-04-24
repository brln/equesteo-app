import { List, Map } from 'immutable'
import moment from 'moment'
import memoizeOne from 'memoize-one'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View
} from 'react-native'

import BuildImage from '../../components/Images/BuildImage'
import { brand, darkGrey } from '../../colors'
import {CARE_EVENT, NEW_MAIN_EVENT_MENU} from '../../screens/care'
import EqNavigation from '../../services/EqNavigation'
import EventList from '../../components/CareCalendar/EventList'

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
    this.state = {
      activeTab: 0
    }
    this.openCareEvent = this.openCareEvent.bind(this)
    this.openEventType = this.openEventType.bind(this)
    this.renderBottomButtons = this.renderBottomButtons.bind(this)
    this.showHorseProfile = this.showHorseProfile.bind(this)

    this.memoDayCareEvents = memoizeOne(this.dayCareEvents.bind(this))

  }


  openEventType () {
    EqNavigation.push(this.props.activeComponent, {
      component: {
        name: NEW_MAIN_EVENT_MENU,
        passProps: {
          popWhenDoneID: this.props.componentId,
        }
      },
    })
  }

  dayCareEvents (day, horses, horseUsers, careEvents, horseCareEvents, userID) {
    const asDate = moment(day, 'YYYY-MM-DD')


    const sortedHCEs = horseCareEvents.valueSeq().reduce((accum, hce) => {
      if (!accum.get(hce.get('careEventID'))) {
        accum = accum.set(hce.get('careEventID'), List())
      }
      return accum.set(hce.get('careEventID'), accum.get(hce.get('careEventID')).push(hce))
    }, Map())

    const dayCareEvents = careEvents.valueSeq().filter(ce => {
      return ce.get('deleted') !== true && moment(ce.get('date')).isSame(asDate, 'day')
    }).map(ce => {
      const hasHorses = sortedHCEs.get(ce.get('_id'))
      const eventHorses = hasHorses ? hasHorses.map(hce => horses.get(hce.get('horseID'))) : List()
      return {
        careEvent: ce.toJS(),
        horses: eventHorses,
      }
    }).toJS()

    dayCareEvents.sort((a, b) => {
      return a.careEvent.date - b.careEvent.date
    })
    return dayCareEvents
  }

  showHorseProfile (horse) {
    return () => {

    }
  }

  openCareEvent (careEventID) {
    return () => {
      EqNavigation.push(this.props.componentId, {
        component: {
          name: CARE_EVENT,
          passProps: {
            careEventID
          }
        }
      })
    }
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
              <Text style={{fontSize: 20, color: 'white'}}>Set Date</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton} onPress={this.newFeedEventNow}>
            <View style={{flex: 1, padding: 5, paddingLeft: 30}}>
              <BuildImage
                source={require('../../img/heavyplus.png')}
                style={{flex: 1, height: 20, width: 20, resizeMode: 'contain'}}
              />
            </View>
            <View style={{flex: 3}}>
              <Text style={{fontSize: 20, color: 'white'}}>Now</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  render() {
    return (
      <View style={{flex: 8}}>
        <EventList
          careEvents={this.memoDayCareEvents(
            this.props.day,
            this.props.horses,
            this.props.horseUsers,
            this.props.careEvents,
            this.props.horseCareEvents,
            this.props.userID
          )}
          horses={this.props.horses}
          horsePhotos={this.props.horsePhotos}
          openCareEvent={this.openCareEvent}
          showHorseProfile={this.showHorseProfile}
        />
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

function mapStateToProps (state, passedProps) {
  const localState = state.get('localState')
  const activeComponent = localState.get('activeComponent')
  const pouchState = state.get('pouchRecords')
  return {
    activeComponent,
    careEvents: pouchState.get('careEvents'),
    day: passedProps.day,
    horseUsers: pouchState.get('horseUsers'),
    horses: pouchState.get('horses'),
    horsePhotos: pouchState.get('horsePhotos'),
    horseCareEvents: pouchState.get('horseCareEvents'),
    newCareEvent: localState.get('newCareEvent'),
    userID: localState.get('userID')
  }
}

export default connect(mapStateToProps)(EventListContainer)
