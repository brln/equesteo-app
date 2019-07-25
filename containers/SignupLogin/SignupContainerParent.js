import React, { PureComponent } from 'react'
import {dismissError} from "../../actions/standard"
import TimeoutManager from '../../services/TimeoutManager'

export default class SignupContainerParent extends PureComponent {
  static navigatorStyle = {
    navBarHidden: true
  }

  static options() {
    return {
      layout: {
        orientation: ['portrait']
      },
      topBar: {
        visible: false,
        drawBehind: true,
      }
    }
  }

  constructor (props) {
    super(props)
    this.clearErrorTimeout = null
  }

  componentWillUnmount () {
    TimeoutManager.deleteTimeout(this.clearErrorTimeout)
  }

  componentDidUpdate (nextProps) {
    if (this.props.error) {
      TimeoutManager.newTimeout(() => {
        this.props.dispatch(dismissError())
      }, 3000)
    }
  }
}
