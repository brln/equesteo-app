import memoizeOne from 'memoize-one'
import React, { PureComponent } from 'react'
import { Platform, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { Fab } from 'native-base';

import FabImage from '../../components/FabImage'
import BuildImage from '../../components/Images/BuildImage'
import { brand } from '../../colors'

class NotificationButton extends PureComponent {
  constructor (props) {
    super(props)
    this.memoAllNotifications = memoizeOne(this.allNotifications.bind(this))
  }

  allNotifications (notifications) {
    return notifications.valueSeq().filter(n => {
      return n.get('seen') !== true
    })
  }

  render() {
    if (this.memoAllNotifications(this.props.notifications).count()) {
      return Platform.select({
        ios: (
          <TouchableOpacity onPress={this.props.onPress}>
            <BuildImage
              source={require('../../img/notifications.png')}
              style={{width: 30, height: 30}}
            />
          </TouchableOpacity>
        ),
        android: (
          <Fab
            direction="up"
            style={{ backgroundColor: brand }}
            position="bottomRight"
            onPress={this.props.onPress}>
            <FabImage source={require('../../img/notification2.png')} height={40} width={40} />
          </Fab>
        )
      })
    } else {
      return null
    }
  }
}

function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  return {
    notifications: pouchState.get('notifications'),
    onPress: passedProps.onPress
  }
}

export default connect(mapStateToProps)(NotificationButton)
