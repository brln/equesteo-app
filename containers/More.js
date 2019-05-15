import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  Dimensions,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { brand, darkGrey, lightGrey } from '../colors'
import { logRender } from '../helpers'
import { BARN, FEEDBACK, FIND_PEOPLE, PROFILE, SETTINGS } from '../screens/main'
import { EVENT_LIST } from '../screens/care'
import Thumbnail from '../components/Images/Thumbnail'
import { EqNavigation } from '../services'
import Amplitude, {
  OPEN_BARN,
  OPEN_CARE_CALENDAR,
  OPEN_FEEDBACK,
  OPEN_FIND_FRIENDS,
  OPEN_MY_ACCOUNT,
  OPEN_SETTINGS,
} from "../services/Amplitude"

const { width } = Dimensions.get('window')

class MoreContainer extends Component {
  static options() {
    return {
      topBar: {
        title: {
          text: "More",
          color: 'white',
          fontSize: 20
        },
        background: {
          color: brand,
        },
        backButton: {
          color: 'white'
        },
        elevation: 0
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
    this.showBarn = this.showBarn.bind(this)
    this.showCareCalendar = this.showCareCalendar.bind(this)
    this.showFeedback = this.showFeedback.bind(this)
    this.showFindFriends = this.showFindFriends.bind(this)
    this.showMyAccount = this.showMyAccount.bind(this)
    this.showSettings = this.showSettings.bind(this)
  }

  shouldComponentUpdate () {
    return false
  }

  showFeedback () {
    Amplitude.logEvent(OPEN_FEEDBACK)
    EqNavigation.push(this.props.activeComponent, {
      component: {
        name: FEEDBACK,
      }
    }).catch(() => {})
  }

  showBarn () {
    Amplitude.logEvent(OPEN_BARN)
    EqNavigation.push(this.props.activeComponent, {
      component: {
        name: BARN,
      }
    }).catch(() => {})
  }

  showFindFriends() {
    Amplitude.logEvent(OPEN_FIND_FRIENDS)
    EqNavigation.push(this.props.activeComponent, {
      component: {
        name: FIND_PEOPLE,
        title: 'Find Friends',
      }
    }).catch(() => {})
  }

  showMyAccount () {
    Amplitude.logEvent(OPEN_MY_ACCOUNT)
    EqNavigation.push(this.props.activeComponent, {
      component: {
        name: PROFILE,
        title: 'My Account',
        passProps: {
          profileUser: this.props.user,
        }
      }
    }).catch(() => {})
  }

  showSettings () {
    Amplitude.logEvent(OPEN_SETTINGS)
    EqNavigation.push(this.props.activeComponent, {
      component: {
        name: SETTINGS,
        title: 'Settings',
      }
    }).catch(() => {})
  }

  showCareCalendar () {
    Amplitude.logEvent(OPEN_CARE_CALENDAR)
    EqNavigation.push(this.props.activeComponent, {
      component: {
        name: EVENT_LIST,
      }
    }).catch(() => {})
  }

  renderMenuItem ({ item }) {
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={{height: 80, backgroundColor: brand}}
          onPress={item.onPress}
        >
          <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: darkGrey, padding: 20}}>
            <View style={{flex: 1, justifyContent:'center'}}>
              <Thumbnail
                emptySource={item.icon}
                empty={true}
                height={width / 7}
                width={width/ 7}
              />
            </View>
            <View style={{flex: 3, justifyContent: 'center'}}>
              <Text style={{color: 'white', fontSize: 20}}>{item.name}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    logRender('MoreContainer')
    const menuItems = Platform.select({
      ios: [
        {
          name: 'Care Calendar',
          icon: require('../img/mainMenus/calendar.png'),
          onPress: this.showCareCalendar
        },
        {
          name: 'My Barn',
          icon: require('../img/mainMenus/barn_wt.png'),
          onPress: this.showBarn
        },
        {
          name: 'Find Friends',
          icon: require('../img/mainMenus/findPeople_wt.png'),
          onPress: this.showFindFriends
        },
        {
          name: 'My Account',
          icon: require('../img/mainMenus/profile_wt.png'),
          onPress: this.showMyAccount
        },
        {
          name: 'Settings',
          icon: require('../img/mainMenus/settings_wt.png'),
          onPress: this.showSettings
        },
        {
          name: 'Feedback',
          icon: require('../img/mainMenus/feedback.png'),
          onPress: this.showFeedback
        }
      ],
      android: [
        {
          name: 'Find Friends',
          icon: require('../img/mainMenus/findPeople_wt.png'),
          onPress: this.showFindFriends
        },
        {
          name: 'My Account',
          icon: require('../img/mainMenus/profile_wt.png'),
          onPress: this.showMyAccount
        },
        {
          name: 'Settings',
          icon: require('../img/mainMenus/settings_wt.png'),
          onPress: this.showSettings
        },
      ]
    })

    return (
      <View>
        <View style={{backgroundColor: lightGrey, height: 30}} />
        <FlatList
          keyExtractor={i => i.name}
          containerStyle={{marginTop: 0}}
          data={menuItems}
          renderItem={this.renderMenuItem}
          style={{height: '100%', borderTopWidth: 1, borderTopColor: darkGrey, backgroundColor: lightGrey}}
        />
      </View>
    )
  }
}

function mapStateToProps (state) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  const users = pouchState.get('users')
  const activeComponent = localState.get('activeComponent')
  const userID = localState.get('userID')
  return {
    activeComponent,
    user: users.get(userID)
  }
}

export default  connect(mapStateToProps)(MoreContainer)
