import React, { PureComponent } from 'react'
import { VictoryArea, VictoryAxis, VictoryChart } from "victory-native"
import {
  StyleSheet,
  View,
} from 'react-native'

import { darkBrand, lightGrey } from '../../colors'
import { logRender } from '../../helpers'

export default class ElevationGain extends PureComponent {
  constructor (props) {
    super(props)
  }

  render () {
    logRender('rendering ElevationProfile')
    // https://github.com/FormidableLabs/victory-native/issues/395
    // Needs the pointerEvents='none' or the chart swallows drag events
    // and scrolling gets fucked.
    return (
      <View pointerEvents='none' style={styles.container}>
        <VictoryChart
          padding={{ top: 50, bottom: 50, left: 80, right: 30 }}
        >
          <VictoryAxis
            label={'mi'}
          />
          <VictoryAxis
            crossAxis={false}
            dependentAxis
            label={'ft'}
            style={{
              axisLabel: {padding: 40},
              grid: {stroke: lightGrey},
            }}

          />
          <VictoryArea
            data={this.props.elevationData}
            style={{ data: { fill: darkBrand, fillOpacity: 0.7 }}}
            x="distance"
            y="gain"
          />
        </VictoryChart>
        <View // Workaround for making swipe/scroll work.
          style={{
            zIndex: 9999,
            position: "absolute",
            width: "100%",
            height: "100%"
          }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});
