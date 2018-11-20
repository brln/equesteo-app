import React, { PureComponent } from 'react'
import { VictoryArea, VictoryAxis, VictoryChart } from "victory-native"
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native'

import { brand, darkBrand, lightGrey } from '../../colors'
import { logRender } from '../../helpers'

const { width } = Dimensions.get('window')

export default class ElevationGain extends PureComponent {
  constructor (props) {
    super(props)
  }

  render () {
    logRender('rendering ElevationProfile')
    return (
      <View style={styles.container}>
        <VictoryChart
          padding={{ top: 50, bottom: 50, left: 80, right: 10 }}
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
