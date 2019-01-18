import moment from 'moment'
import React, { PureComponent } from 'react'
import { VictoryArea, VictoryBar, VictoryAxis, VictoryChart, VictoryLine } from "victory-native"
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native'

const { width } = Dimensions.get('window')

import { brand, darkGrey, darkBrand, lightGrey } from '../../colors'
import { dateArray, addDays, metersToFeet } from '../../helpers'

export default class TimeChart extends PureComponent {
  constructor (props) {
    super(props)
    this.data = this.data.bind(this)
    this.days = this.days.bind(this)
    this.months = this.months.bind(this)
    this.weeks = this.weeks.bind(this)
    this.yMeta = this.yMeta.bind(this)
  }

  days () {
    const today = new Date()
    const thirtyAgo = addDays(today, (-1 * this.props.showDays))
    return dateArray(thirtyAgo, today).map(d => moment(d).format('M-D-YYYY'))
  }

  weeks () {
    return Object.keys(
      this.days().reduce((a, d) => {
        const week = moment(d, 'M-D-YYYY').format('w-YYYY')
        a[week] = true
        return a
      }, {})
    ).sort((a, b) => moment(a, 'w-YYYY') - moment(b, 'w-YYYY'))
  }

  months () {
    return Object.keys(
      this.days().reduce((a, d) => {
        const month = moment(d, 'M-D-YYYY').format('MM-YYYY')
        a[month] = true
        return a
      }, {})
    ).sort((a, b) => moment(a, 'MM-YYYY') - moment(b, 'MM-YYYY'))
  }

  data () {
    const days = this.days()
    const dailyData = {}
    const weeklyData = {}
    const monthlyData = {}
    for (let ride of this.props.trainings) {
      const startMoment = moment(ride.get('startTime'))
      const day = startMoment.format('M-D-YYYY')
      const week = startMoment.format('w-YYYY')
      const month = startMoment.format('MM-YYYY')

      if (days.indexOf(day) >= 0) {
        const asMoment = moment(day, 'M-D-YYYY')
        if (this.props.rideShouldShow(ride, asMoment)) {
          let yVal
          switch(this.props.chosenType) {
            case this.props.types.DISTANCE:
              yVal = ride.get('distance')
              break
            case this.props.types.TYPE_TIME:
              yVal = ride.get('elapsedTimeSecs') / 60 / 60
              break
            case this.props.types.TYPE_GAIN:
              yVal = metersToFeet(ride.get('elevationGain')) || 0
              break
          }
          if (!dailyData[day]) {
            dailyData[day] = []
          }
          if (!weeklyData[week]) {
            weeklyData[week] = []
          }
          if (!monthlyData[month]) {
            monthlyData[month] = []
          }

          let horseColor = brand
          if (ride.get('horseIDs').count() > 0) {
            const firstHorseID = ride.getIn(['horseIDs', 0])
            const firstHorse = this.props.horses.get(firstHorseID)
            if (firstHorse && firstHorse.get('color')) {
              horseColor = firstHorse.get('color')
            }
          }

          const dailyY0 = dailyData[day].reduce((a, d) => { return a + (d.y - d.y0) }, 0)
          dailyData[day].push({x: day, y: yVal + dailyY0, y0: dailyY0, fill: horseColor})

          const weeklyY0 = weeklyData[week].reduce((a, d) => { return a + (d.y - d.y0) }, 0)
          weeklyData[week].push({x: week, y: yVal + weeklyY0, y0: weeklyY0, fill: horseColor})

          const monthlyY0 = monthlyData[month].reduce((a, d) => { return a + (d.y - d.y0) }, 0)
          monthlyData[month].push({x: month, y: yVal + monthlyY0, y0: monthlyY0, fill: horseColor})
        }
      }
    }

    function redu (obj) {
      return Object.keys(obj).reduce((a, d) => { return a.concat(obj[d])}, [])
    }

    return {
      daily: redu(dailyData),
      weekly: redu(weeklyData),
      monthly: redu(monthlyData),
    }
  }

  yMeta () {
    let yLabel
    let chartLeftPadding = 60
    let axisPadding = 40
    switch(this.props.chosenType) {
      case this.props.types.DISTANCE:
        yLabel = 'Miles'
        break
      case this.props.types.TYPE_TIME:
        yLabel = 'Hours'
        axisPadding = 40
        break
      case this.props.types.TYPE_GAIN:
        yLabel = 'Vertical Feet'
        chartLeftPadding = 80
        axisPadding = 55
        break
    }
    return {
      label: yLabel,
      chartLeftPadding,
      axisPadding
    }
  }

  xMeta () {
    let dataTimeframe
    let categories
    let tickFormat
    let tickCount
    let label
    let barRatio
    switch(this.props.showDays) {
      case 7:
        dataTimeframe = 'daily'
        categories = this.days()
        tickFormat = (dateString) => {
          const date = moment(dateString, 'M-D-YYYY')
          return date.format('M/D')
        }
        tickCount = 6
        label = 'Day'
        barRatio = 3
        break
      case 30:
        dataTimeframe = 'daily'
        categories = this.days()
        tickFormat = (dateString) => {
          const date = moment(dateString, 'M-D-YYYY')
          return date.format('M/D')
        }
        tickCount = 7
        label = 'Day'
        barRatio = 0.3
        break
      case 90:
        dataTimeframe = 'weekly'
        categories = this.weeks()
        tickFormat = (dateString) => {
          const date = moment(dateString, 'w-YYYY')
          return date.format('M/D')
        }
        tickCount = 5
        label = 'Week'
        barRatio = 3
        break
      case 365:
        categories = this.months()
        console.log(categories)
        dataTimeframe = 'monthly'
        tickFormat = (dateString) => {
          const date = moment(dateString, 'MM-YYYY')
          return date.format('M')
        }
        tickCount = 11
        label = 'Month'
        barRatio = 8
        break
    }
    return {
      dataTimeframe,
      categories,
      tickFormat,
      tickCount,
      label,
      barRatio,
    }
  }

  render () {
    const yMetaData = this.yMeta()
    const xMetaData = this.xMeta()
    return (
      // https://github.com/FormidableLabs/victory-native/issues/395
      // Needs the pointerEvents='none' or the chart swallows drag events
      // and scrolling gets fucked.
      <View pointerEvents='none' style={styles.container}>
        <VictoryChart
          padding={{bottom: 70, left: yMetaData.chartLeftPadding, right: 25, top: 10 }}
        >
          <VictoryBar
            alignment={'start'}
            barRatio={xMetaData.barRatio}
            categories={{x: xMetaData.categories}}
            style={{ data: { fill: x => x.fill, stroke: darkGrey }}}
            data={this.data()[xMetaData.dataTimeframe]}
          />
          <VictoryAxis
            label={xMetaData.label}
            tickFormat={xMetaData.tickFormat}
            style={{ticks: {stroke: "grey", size: 5}, axisLabel: {padding: 40, fontSize: 12}}}
            tickCount={xMetaData.tickCount}
          />
          <VictoryAxis
            dependentAxis
            label={yMetaData.label}
            style={{axisLabel: {padding: yMetaData.axisPadding, fontSize: 12}}}
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
