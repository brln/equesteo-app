import React, { PureComponent } from 'react'
import { VictoryArea, VictoryAxis, VictoryChart, VictoryLine } from "victory-native"
import {
  StyleSheet,
  View,
} from 'react-native'

import { brand, darkBrand, lightGrey } from '../../colors'
import { logRender, speedGradient } from '../../helpers'

export default class SpeedChart extends PureComponent {
  constructor (props) {
    super(props)
  }

  render () {
    logRender('rendering SpeedChart')
    return (
      // https://github.com/FormidableLabs/victory-native/issues/395
      // Needs the pointerEvents='none' or the chart swallows drag events
      // and scrolling gets fucked.
      <View pointerEvents='none' style={styles.container}>
        <VictoryChart
          padding={{bottom: 50, left: 80, right: 10 }}
        >
          <VictoryAxis
            label={'mi'}
          />
          <VictoryAxis
            dependentAxis
            label={'mph'}
            style={{
              axisLabel: {padding: 40},
              grid: {stroke: (t) => speedGradient(t), opacity: 0.5},
            }}
          />
          <VictoryArea
            data={this.props.speedData}
            style={{ data: { fill: brand, fillOpacity: 0.7 }}}
            x="distance"
            y="max"
            y0="min"
          />
          <VictoryLine
            data={this.props.speedData}
            x="distance"
            y="speed"
            style={{
              data: {stroke: darkBrand, strokeWidth: 1}
            }}
          />
        </VictoryChart>
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
