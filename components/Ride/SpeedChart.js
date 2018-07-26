import React, { PureComponent } from 'react'
import { VictoryArea, VictoryAxis, VictoryChart } from "victory-native"
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native'

const { height, width } = Dimensions.get('window')

export default class SpeedChart extends PureComponent {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <View style={styles.container}>
        <VictoryChart width={width} height={(height / 2) - 20}>
          <VictoryArea data={this.props.speedData} x="distance" y="pace" />
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
