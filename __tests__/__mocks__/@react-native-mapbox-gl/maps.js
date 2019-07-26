import React, { Component } from 'react';

export default class MapboxGL {
  static StyleSheet = {
    create: (x) => { return x },
    identity: () => {},
  }

  static MapView = class MapView extends Component {
    render () {
      return null
    }
  }

  static ShapeSource = class ShapeSource extends Component {
    render () {
      return null
    }
  }

  static LineView = class LineView extends Component {
    render () {
      return null
    }
  }

  static SymbolLayer = class SymbolLayer extends Component {
    render () {
      return null
    }
  }

  static LineLayer = class LineLayer extends Component {
    render () {
      return null
    }
  }
}
