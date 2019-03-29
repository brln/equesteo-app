import memoizeOne from 'memoize-one'
import React, { PureComponent } from 'react'
import { TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'

import BuildImage from '../../components/Images/BuildImage'

class NotificationButton extends PureComponent {
  constructor (props) {
    super(props)
    this.memoAllNotifications = memoizeOne(this.allNotifications.bind(this))
  }

  allNotifications (notifications, rides) {
    return notifications.valueSeq().filter(n => {
      return n.get('seen') !== true && rides.get(n.get('rideID'))
    })
  }

  render() {
    if (this.memoAllNotifications(this.props.notifications, this.props.rides).count()) {
      return (
        <TouchableOpacity onPress={this.props.onPress}>
          <BuildImage
            source={require('../../img/notifications.png')}
            style={{width: 30, height: 30}}
          />
        </TouchableOpacity>
      )
    } else {
      return null
    }
  }
}

function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  return {
    notifications: pouchState.get('notifications'),
    rides: pouchState.get('rides'),
    onPress: passedProps.onPress
  }
}

export default connect(mapStateToProps)(NotificationButton)
