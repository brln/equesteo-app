import React, { PureComponent } from 'react'
import { VictoryArea, VictoryAxis, VictoryChart, VictoryLabel, VictoryLine } from "victory-native"
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { brand, darkBrand, lightGrey } from '../../colors'
import { logRender } from '../../helpers'

const { width } = Dimensions.get('window')

export default class ElevationProfile extends PureComponent {
  constructor (props) {
    super(props)
  }

  render () {
    logRender('rendering ElevationProfile')
    const minDomainY = this.props.elevationData.sort((a, b) => {
      return a.elevation < b.elevation
    })[0].elevation
    return (
      <View style={styles.container}>
        <VictoryChart
          padding={{ top: 50, bottom: 50, left: 80, right: 10 }}
          minDomain={{y: minDomainY - 100}}
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
