import React, { PureComponent } from 'react'
import { VictoryAxis, VictoryBar, VictoryChart } from "victory-native"
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native'

import { logRender } from '../../helpers'

const { width } = Dimensions.get('window')

export default class PaceChart extends PureComponent {
  constructor (props) {
    super(props)
  }

  render () {
    logRender('rendering PaceChart')
    const maxY = Math.max(...this.props.speedData.map(d => d.distance)) * 1.25
    return (
      // https://github.com/FormidableLabs/victory-native/issues/395
      // Needs the pointerEvents='none' or the chart swallows drag events
      // and scrolling gets fucked.
      <View pointerEvents='none' style={styles.container}>
        <VictoryChart
          padding={{bottom: 50, left: 30, right: 10 }}
          height={150}
          width={width}
        >
          <VictoryBar
            barRatio={1}
            domain={{x: [0, maxY]}}
            data={this.props.speedData}
            horizontal={true}
            labels={d => d.label}
            x="x"
            y="distance"
            style={{
              data: {fill: d => d.color}
            }}
          />
          <VictoryAxis
            label={'mi'}
          />
          <VictoryAxis
            domain={{y: [0.5, 4.5]}}
            dependentAxis
            offsetY={-1}
            tickFormat={_ => ''}
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
