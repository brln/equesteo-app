import memoizeOne from 'memoize-one'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { View, Text } from 'react-native'
import PushNotification from 'react-native-push-notification'
import firebase from 'react-native-firebase'


import { brand } from '../colors'
import { markNotificationSeen } from "../actions/functional"
import { logRender } from '../helpers'
import NotificationList from '../components/NotificationsList/NotificationsList'
import { RIDE } from '../screens'
import { EqNavigation } from '../services'

class NotificationsListContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        elevation: 0,
        backButton: {
          color: 'white'
        },
        title: {
          color: 'white',
          text: 'Notifications'
        }
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
    this.memoAllNotifications = memoizeOne(this.allNotifications.bind(this))
    this.justClear = this.justClear.bind(this)
    this.showRide = this.showRide.bind(this)
    this.showAndClear = this.showAndClear.bind(this)
  }

  componentDidMount() {
    PushNotification.cancelAllLocalNotifications()
    firebase.notifications().cancelAllNotifications()
  }


  showRide (rideID, skipToComments) {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: RIDE,
        passProps: {
          rideID,
          skipToComments,
        }
      }
    })
  }

  showAndClear (notificationID, rideID, skipToComments) {
    return () => {
      const theNotification = this.props.notifications.get(notificationID)
      this.props.dispatch(markNotificationSeen(theNotification))
      this.showRide(rideID, skipToComments)
    }
  }

  justClear (notificationID) {
    const theNotification = this.props.notifications.get(notificationID)
    this.props.dispatch(markNotificationSeen(theNotification))
  }

  allNotifications (notifications, rides) {
    return notifications.valueSeq().filter(n => {
      return n.get('seen') !== true && rides.get(n.get('rideID'))
    })
  }

  render() {
    logRender('NotificationsListContainer')
    if (this.memoAllNotifications(this.props.notifications, this.props.rides).count()) {
      return (
        <NotificationList
          justClear={this.justClear}
          notifications={this.memoAllNotifications(this.props.notifications, this.props.rides)}
          showAndClear={this.showAndClear}
        />
      )
    } else {
      return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text>All caught up!</Text>
        </View>
      )
    }
  }
}

function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  return {
    notifications: pouchState.get('notifications'),
    rides: pouchState.get('rides'),
  }
}

export default connect(mapStateToProps)(NotificationsListContainer)
