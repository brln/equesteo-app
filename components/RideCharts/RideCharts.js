import memoizeOne from 'memoize-one';
import React, { PureComponent } from 'react';
import {
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  Card,
  CardItem,
} from 'native-base'

import {
  haversine,
  parseElevationData,
  parseRideCoordinate,
  speedGradient
} from '../../helpers'
import ElevationGain from './ElevationGain'
import ElevationProfile from './ElevationProfile'
import SpeedChart from './SpeedChart'

export default class RideCharts extends PureComponent {
  constructor (props) {
    super(props)

    this.memoizedParse = memoizeOne(this.parseSpeedData)
    this.memoizedParseElevation = memoizeOne(parseElevationData)
  }

  parseSpeedData (rideCoordinates) {
    const parsedData = []
    let parsedBucket = []
    let lastPoint = null
    let fullDistance = 0

    const desiredNumCoords = 300
    const actualNumCoords = rideCoordinates.count()
    const bucketSize = Math.ceil(actualNumCoords / desiredNumCoords)

    for (let rideCoord of rideCoordinates) {
      const parsedCoord = parseRideCoordinate(rideCoord)
      if (!lastPoint) {
        parsedBucket.push({distance: 0, speed: 0})
      } else {
        const distance = haversine(
          lastPoint.get('latitude'),
          lastPoint.get('longitude'),
          parsedCoord.get('latitude'),
          parsedCoord.get('longitude')
        )
        fullDistance += distance

        const timeDiff = (parsedCoord.get('timestamp') / 1000) - (lastPoint.get('timestamp') / 1000)
        if (timeDiff === 0) {
          continue
        }
        const mpSecond = distance / timeDiff
        const mph = mpSecond * 60 * 60
        parsedBucket.push({ speed: mph })
      }
      lastPoint = parsedCoord

      if (parsedBucket.length === bucketSize) {
        const speed = parsedBucket.reduce((acc, val) => acc + val.speed, 0) / bucketSize
        const speeds = parsedBucket.map(val => val.speed)
        const max = Math.max(...speeds)
        const min = Math.min(...speeds)
        parsedData.push({ distance: fullDistance, speed, max, min, color: speedGradient(speed) })
        parsedBucket = []
      }
    }
    return parsedData
  }

  speedChart () {
    let container = function (child) {
      return ( <Card>
        <CardItem header>
          <Text style={{fontSize: 20}}>Speed</Text>
        </CardItem>
        <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
          { child }
        </CardItem>
      </Card> )
    }
    let speedChart = (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300}}>
        <Text>Not enough data for speed chart.</Text>
      </View>
    )
    let speedData = this.memoizedParse(this.props.rideCoordinates.get('rideCoordinates'))
    if (speedData.length >= 2) {
      speedChart = (
        <SpeedChart
          speedData={speedData}
        />
      )
    }
    return container(speedChart)
  }

  elevationProfile () {
    let container = function (child) {
      return ( <Card>
        <CardItem header>
          <Text style={{fontSize: 20}}>Elevation Profile</Text>
        </CardItem>
        <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
          { child }
        </CardItem>
      </Card> )
    }
    let elevationChart = (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300}}>
        <Text>Not enough data for elevation profile.</Text>
      </View>
    )
    let elevationData = this.memoizedParseElevation(
      this.props.rideCoordinates.get('rideCoordinates'),
      this.props.rideElevations.get('elevations')
    )
    if (elevationData.length >= 2) {
      elevationChart = (
        <ElevationProfile
          elevationData={elevationData}
        />
      )
    }
    return container(elevationChart)
  }

  elevationGain () {
    let container = function (child) {
      return ( <Card>
        <CardItem header>
          <Text style={{fontSize: 20}}>Elevation Gain</Text>
        </CardItem>
        <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>
          { child }
        </CardItem>
      </Card> )
    }
    let elevationChart = (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300}}>
        <Text>Not enough data for elevation gain chart.</Text>
      </View>
    )
    let elevationData = this.memoizedParseElevation(
      this.props.rideCoordinates.get('rideCoordinates'),
      this.props.rideElevations.get('elevations')
    )
    if (elevationData.length >= 2) {
      elevationChart = (
        <ElevationGain
          elevationData={elevationData}
        />
      )
    }
    return container(elevationChart)
  }

  render () {
    return (
      <ScrollView>
        { this.speedChart() }
        { this.props.rideElevations ? this.elevationProfile() : null}
        { this.props.rideElevations ? this.elevationGain() : null}
      </ScrollView>
    )
  }
}

