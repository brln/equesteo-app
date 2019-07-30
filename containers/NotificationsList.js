import memoizeOne from 'memoize-one'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Alert, Text, View } from 'react-native'
import PushNotification from 'react-native-push-notification'
import firebase from 'react-native-firebase'
import { Navigation } from 'react-native-navigation'

import { brand } from '../colors'
import functional from "../actions/functional"
import { logRender } from '../helpers'
import NotificationList from '../components/NotificationsList/NotificationsList'
import { RIDE } from '../screens/consts/main'
import { EqNavigation } from '../services'
import Amplitude, {
  CLEAR_ALL_NOTIFICATIONS,
  CLEAR_ONE_NOTIFICATION,
  VIEW_NOTIFICATION_RIDE,
} from "../services/Amplitude"
import RideLoading from '../components/Training/RideLoading'
import TimeoutManager from '../services/TimeoutManager'

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
      deleted: [],
      loadingRide: false,
    }

    this.memoAllNotifications = memoizeOne(this.allNotifications.bind(this))
    this.markNotificationSeen = this.markNotificationSeen.bind(this)
    this.navigationButtonPressed = this.navigationButtonPressed.bind(this)
    this.justClear = this.justClear.bind(this)
    this.showRide = this.showRide.bind(this)
    this.showAndClear = this.showAndClear.bind(this)

    Navigation.events().bindComponent(this);
    this.loadingRideFailedTimeout = null
    this.loadingRideAlertTimeout = null
  }

  componentWillUnmount () {
    if (this.state.deleted.length > 0) {
      this.props.dispatch(functional.markNotificationsSeen(this.state.deleted))
    }
    TimeoutManager.deleteTimeout(this.loadingRideAlertTimeout)
    TimeoutManager.deleteTimeout(this.loadingRideAlertTimeout)
  }

  navigationButtonPressed ({ buttonId }) {
    if (buttonId === 'clearAll') {
      Amplitude.logEvent(CLEAR_ALL_NOTIFICATIONS)
      const notifications = this.memoAllNotifications(this.props.notifications, this.state.deleted)
      for (let notification of notifications) {
        this.justClear(notification.get('_id'), true)
      }
    }
  }

  componentDidMount() {
    PushNotification.cancelAllLocalNotifications()
    firebase.notifications().cancelAllNotifications()
  }


  showRide (rideID, skipToComments, notificationID) {
    if (this.props.rides.get(rideID)) {
      return EqNavigation.push(this.props.componentId, {
        component: {
          name: RIDE,
          passProps: {rideID: rideID}
        }
      }).catch(() => {})
    } else if (this.props.goodConnection) {
      this.setState({ loadingRide: true })
      return this.props.dispatch(functional.loadSingleRide(rideID)).then(() => {
        this.setState({ loadingRide: false })
        this.markNotificationSeen(notificationID)
        return EqNavigation.push(this.props.componentId, {
          component: {
            name: RIDE,
            passProps: {
              rideID,
              skipToComments,
            },
            options: {
              animations: {
                push: {
                  enabled: false
                }
              }
            }
          },

        })
      }).catch(() => {
        this.loadingRideFailedTimeout = TimeoutManager.newTimeout(() => {
          this.setState({ loadingRide: false })
          this.loadingRideAlertTimeout = TimeoutManager.newTimeout(() => {
            Alert.alert(
              'Not Available',
              'We can\'t load this ride for some reason. \n\n Please contact us if you keep seeing this. info@equesteo.com',
              [{ text: 'OK' }],
              {cancelable: true}
            )
          }, 500)
        }, 500)
      })
    } else {
      Alert.alert(
        'Not Available',
        'This ride data is not available offline. \n\n Please try again when you have service.',
        [
          {
            text: 'OK',
          },
        ],
        {cancelable: true}
      )
      return Promise.reject()
    }
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
      Amplitude.logEvent(VIEW_NOTIFICATION_RIDE)
      this.showRide(rideID, skipToComments, notificationID)
    }
  }

  justClear (notificationID, clearingMany=false) {
    if (!clearingMany) {
      Amplitude.logEvent(CLEAR_ONE_NOTIFICATION)
    }
    this.markNotificationSeen(notificationID)
  }

  allNotifications (notifications, deleted) {
    return notifications.valueSeq().filter(n => {
      return n.get('seen') !== true && n.get('rideID') && deleted.indexOf(n.get('_id')) < 0
    })
  }

  render() {
    logRender('NotificationsListContainer')
    let main
    if (this.memoAllNotifications(this.props.notifications, this.state.deleted).count()) {
      main = (
        <NotificationList
          justClear={this.justClear}
          notifications={this.memoAllNotifications(this.props.notifications, this.state.deleted)}
          showAndClear={this.showAndClear}
        />
      )
    } else {
      main = (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text>All caught up!</Text>
        </View>
      )
    }
    return (
      <View style={{flex: 1}}>
        <RideLoading
          modalOpen={this.state.loadingRide}
        />
        { main }
      </View>
    )
  }
}

function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  return {
    goodConnection: localState.get('goodConnection'),
    notifications: pouchState.get('notifications'),
    rides: pouchState.get('rides'),
  }
}

export default connect(mapStateToProps)(NotificationsListContainer)
