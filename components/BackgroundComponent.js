import React, { Component } from 'react'

export default class BackgroundComponent extends Component {
  shouldComponentUpdate (nextProps, nextState) {
    if (nextProps.activeComponent === nextProps.componentId) {
      return nextProps !== this.props || nextState !== this.state
    } else {
      return false
    }
  }
}
