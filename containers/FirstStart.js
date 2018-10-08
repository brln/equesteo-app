import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Text } from 'react-native'

import { brand } from '../colors'
import { logRender } from '../helpers'

class FirstStartContainer extends PureComponent {
  static options() {
    return {
      topBar: {
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
  }

  render() {
    logRender('FirstStartContainer')
    return (
      <Text>Welcome the Jungle</Text>
    )
  }
}

function mapStateToProps (state) {
  const mainState = state.get('main')
  const localState = mainState.get('localState')
  return {
    user: state.getIn(['users', localState.get('userID')])
  }
}
export default connect(mapStateToProps)(FirstStartContainer)
