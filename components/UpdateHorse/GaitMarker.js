import React from 'react'
import PropTypes from 'prop-types'
import {
  View,
  StyleSheet,
  Text,
  Platform,
  TouchableHighlight
} from 'react-native'

import { speedGradient } from "../../helpers"

const ViewPropTypes = require('react-native').ViewPropTypes || View.propTypes;

export class GaitMarker extends React.Component {
  static propTypes = {
    pressed: PropTypes.bool,
    pressedMarkerStyle: ViewPropTypes.style,
    markerStyle: ViewPropTypes.style,
    enabled: PropTypes.bool,
    currentValue: PropTypes.number,
    valuePrefix: PropTypes.string,
    valueSuffix: PropTypes.string,
  };

  render() {
    let speedText = (
      <Text style={{fontSize: 10, textAlign: 'center'}} />
    )
    if (this.right) {
      speedText = (
        <Text style={{fontSize: 10, textAlign: 'center'}}>{this.props.currentValue}</Text>
      )
    }
    return (
      <TouchableHighlight>
        <View style={{flex: 1}}>
          <View style={{minHeight: 15}}>
            { speedText }
          </View>
          <View
            style={[
              styles.markerStyle,
              this.props.pressed && styles.pressedMarkerStyle,
              this.props.pressed && this.props.pressedMarkerStyle,
              { backgroundColor: speedGradient(this.props.currentValue) }
            ]}
          />
          </View>
      </TouchableHighlight>
    );
  }
}

export class GaitMarkerLeft extends GaitMarker {
  constructor () {
    super()
    this.left = true
  }
}

export class GaitMarkerRight extends GaitMarker {
  constructor () {
    super()
    this.right = true
  }
}

const styles = StyleSheet.create({
  markerStyle: {
    ...Platform.select({
      ios: {
        height: 30,
        width: 30,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowRadius: 1,
        shadowOpacity: 0.2,
      },
      android: {
        height: 30,
        width: 20,
        borderRadius: 12,
      },
    }),
  },
  pressedMarkerStyle: {
    ...Platform.select({
      ios: {},
      android: {
        height: 30,
        width: 30,
        borderRadius: 20,
      },
    }),
  },
  disabled: {
    backgroundColor: '#d3d3d3',
  },
});
