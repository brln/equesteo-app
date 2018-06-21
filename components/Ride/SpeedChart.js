import React, { Component } from 'react'
import { VictoryArea, VictoryAxis, VictoryChart } from "victory-native"
import memoizeOne from 'memoize-one';
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native'

import { haversine } from '../../helpers'


const { height, width } = Dimensions.get('window')

export default class SpeedChart extends Component {
  constructor (props) {
    super(props)
    this.memoizedParse = memoizeOne(this.parseData)
  }

  parseData (rideCoordinates) {
    console.log('parsing speedchart data')
    const parsedData = []
    let parsedBucket = []
    let lastPoint = null
    let fullDistance = 0

    const desiredNumCoords = 85
    const actualNumCoords = rideCoordinates.length
    const bucketSize = Math.ceil(actualNumCoords / desiredNumCoords)

    for (let rideCoord of rideCoordinates) {
      if (!lastPoint) {
        parsedBucket.push({distance: 0, pace: 0})
      } else {
        const distance = haversine(
          lastPoint.latitude,
          lastPoint.longitude,
          rideCoord.latitude,
          rideCoord.longitude
        )
        fullDistance += distance

        const timeDiff = (rideCoord.timestamp / 1000) - (lastPoint.timestamp / 1000)
        const mpSecond = distance / timeDiff
        const mph = mpSecond * 60 * 60
        parsedBucket.push({ pace: mph })
      }
      lastPoint = rideCoord

      if (parsedBucket.length === bucketSize) {
        const pace = parsedBucket.reduce((acc, val) => acc + val.pace, 0) / bucketSize
        parsedData.push({ distance: fullDistance, pace })
        parsedBucket = []
      }
    }
    return parsedData
  }

  render () {

    return (
      <View style={styles.container}>
        <VictoryChart width={width} height={(height / 2) - 20}>
          <VictoryArea data={this.memoizedParse(this.props.rideCoordinates)} x="distance" y="pace" />
          <VictoryAxis
            label={'mi'}
          />
          <VictoryAxis
            dependentAxis
            label={'mph'}
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
