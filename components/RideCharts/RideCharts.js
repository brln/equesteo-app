import memoizeOne from 'memoize-one';
import React, { PureComponent } from 'react';
import {
  Dimensions,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  Card,
  CardItem,
} from 'native-base'

import { haversine, parseRideCoordinate, toElevationKey } from '../../helpers'
import ElevationGain from './ElevationGain'
import ElevationProfile from './ElevationProfile'
import SpeedChart from './SpeedChart'

const { height, width } = Dimensions.get('window')

export default class RideCharts extends PureComponent {
  constructor (props) {
    super(props)

    this.memoizedParse = memoizeOne(this.parseSpeedData)
    this.memoizedParseElevation = memoizeOne(this.parseElevationData)
  }

  parseElevationData (rideCoordinates, rideElevations) {
    let totalDistance = 0
    let totalGain = 0
    let lastPoint = null
    let points = []

    for (let rideCoord of rideCoordinates) {
      const parsedCoord = parseRideCoordinate(rideCoord)
      if (!lastPoint) {
        lastPoint = parsedCoord
      } else {
        totalDistance += haversine(
          lastPoint.get('latitude'),
          lastPoint.get('longitude'),
          parsedCoord.get('latitude'),
          parsedCoord.get('longitude')
        )
        const elevation = rideElevations.getIn([
          toElevationKey(parsedCoord.get('latitude')),
          toElevationKey(parsedCoord.get('longitude'))
        ])
        const lastElevation = rideElevations.getIn([
          toElevationKey(lastPoint.get('latitude')),
          toElevationKey(lastPoint.get('longitude'))
        ])
        const diff = Math.abs(lastElevation - elevation)
        const percentDiff = diff / elevation
        if (diff && percentDiff < 0.15) {
          const elevationChange = elevation - lastElevation
          totalGain += elevationChange > 0 ? elevationChange : 0
          points.push({
            elevation,
            distance: totalDistance,
            gain: totalGain
          })
        }
        lastPoint = parsedCoord
      }
    }
    return points
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
        parsedBucket.push({distance: 0, pace: 0})
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
        parsedBucket.push({ pace: mph })
      }
      lastPoint = parsedCoord

      if (parsedBucket.length === bucketSize) {
        const pace = parsedBucket.reduce((acc, val) => acc + val.pace, 0) / bucketSize
        const paces = parsedBucket.map(val => val.pace)
        const max = Math.max(...paces)
        const min = Math.min(...paces)
        parsedData.push({ distance: fullDistance, pace, max, min })
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

