import React from 'react'
import { connect } from 'react-redux'
import { TouchableOpacity } from 'react-native'

import BuildImage from '../../components/Images/BuildImage'


const NotificationButton = (props) => {
  if (props.notifications.valueSeq().filter(n => !n.get('seen')).count()) {
    return (
      <TouchableOpacity onPress={props.onPress}>
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


function mapStateToProps (state, passedProps) {
  const pouchState = state.get('pouchRecords')
  return {
    notifications: pouchState.get('notifications'),
    onPress: passedProps.onPress
  }
}

export default connect(mapStateToProps)(NotificationButton)
