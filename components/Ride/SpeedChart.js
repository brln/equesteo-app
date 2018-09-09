import React, { PureComponent } from 'react'
import { VictoryArea, VictoryAxis, VictoryChart, VictoryLine } from "victory-native"
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native'

import { brand, darkBrand, lightGrey } from '../../colors'
import { logRender } from '../../helpers'

const { height, width } = Dimensions.get('window')

export default class SpeedChart extends PureComponent {
  constructor (props) {
    super(props)
  }

  render () {
    logRender('rendering SpeedChart')
    console.log(this.props.speedData)
    return (
      <View style={styles.container}>
        <VictoryChart
          width={width}
          height={(width * 9 / 16) + 54}
          padding={{ top: 50, bottom: 50, left: 55, right: 10 }}
        >
          <VictoryAxis
            label={'mi'}
          />
          <VictoryAxis
            dependentAxis
            label={'mph'}
            style={{
              axisLabel: {padding: 40},
              grid: {stroke: lightGrey},
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
            y="pace"
           style={{
             data: {stroke: darkBrand, strokeWidth: 1}
           }}
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
    backgroundColor: "#f5fcff"
  }
});
