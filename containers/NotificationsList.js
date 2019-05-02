import memoizeOne from 'memoize-one'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { View, Text } from 'react-native'
import PushNotification from 'react-native-push-notification'
import firebase from 'react-native-firebase'
import { Navigation } from 'react-native-navigation'

import { brand } from '../colors'
import { markNotificationsSeen } from "../actions/functional"
import { logRender } from '../helpers'
import NotificationList from '../components/NotificationsList/NotificationsList'
import { RIDE } from '../screens/main'
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
        },
        rightButtons: [
          {
            id: 'clearAll',
            text: 'Clear All',
            color: 'white'
          },
        ]
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
    this.state = {
      deleted: []
    }

    this.memoAllNotifications = memoizeOne(this.allNotifications.bind(this))
    this.markNotificationSeen = this.markNotificationSeen.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.justClear = this.justClear.bind(this)
    this.showRide = this.showRide.bind(this)
    this.showAndClear = this.showAndClear.bind(this)

    Navigation.events().bindComponent(this);
  }

  componentWillUnmount () {
    if (this.state.deleted.length > 0) {
      this.props.dispatch(markNotificationsSeen(this.state.deleted))
    }
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'clearAll') {
      const notifications = this.memoAllNotifications(this.props.notifications, this.props.rides, this.state.deleted)
      for (let notification of notifications) {
        this.justClear(notification.get('_id'))
      }
    }
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

  markNotificationSeen (id) {
    const newDeleted = [ ...this.state.deleted ]
    newDeleted.push(id)
    this.setState({
      deleted: newDeleted
    })
  }

  showAndClear (notificationID, rideID, skipToComments) {
    return () => {
      this.markNotificationSeen(notificationID)
      this.showRide(rideID, skipToComments)
    }
  }

  justClear (notificationID) {
    this.markNotificationSeen(notificationID)
  }

  allNotifications (notifications, rides, deleted) {
    return notifications.valueSeq().filter(n => {
      return n.get('seen') !== true && rides.get(n.get('rideID')) && deleted.indexOf(n.get('_id')) < 0
    })
  }

  render() {
    logRender('NotificationsListContainer')
    if (this.memoAllNotifications(this.props.notifications, this.props.rides, this.state.deleted).count()) {
      return (
        <NotificationList
          justClear={this.justClear}
          notifications={this.memoAllNotifications(this.props.notifications, this.props.rides, this.state.deleted)}
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
