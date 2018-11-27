import memoizeOne from 'memoize-one';
import React, { PureComponent } from 'react'
import { VictoryArea, VictoryAxis, VictoryChart } from "victory-native"
import {
  StyleSheet,
  View,
} from 'react-native'

import { darkBrand, lightGrey } from '../../colors'
import { logRender } from '../../helpers'

export default class ElevationProfile extends PureComponent {
  constructor (props) {
    super(props)
    this.memoMinDomain = memoizeOne(this.minDomain.bind(this))
  }

  minDomain (elevationData) {
    const minElevation = elevationData.reduce((a, e) => {
      return a < e.elevation ? a : e.elevation
    }, elevationData[0].elevation)
    return minElevation - 10
  }

  render () {
    logRender('rendering ElevationProfile')
    return (
      <View style={styles.container}>
        <VictoryChart
          padding={{ top: 50, bottom: 50, left: 80, right: 10 }}
          minDomain={{y: this.memoMinDomain(this.props.elevationData)}}
        >
          <VictoryAxis
            label={'mi'}
          />
          <VictoryAxis
            crossAxis={true}
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
            y="elevation"
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
