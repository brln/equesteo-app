import React, { Component } from 'react'
import LoggedComponent from './Debug/LoggedComponent'

export default class BackgroundComponent extends LoggedComponent {
  shouldComponentUpdate (nextProps, nextState) {
    if (nextProps.activeComponent === nextProps.componentId) {
      return nextProps !== this.props || nextState !== this.state
    } else {
      return false
    }
  }
}
