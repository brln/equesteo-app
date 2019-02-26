import memoizeOne from 'memoize-one';
import React, { PureComponent } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
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
import BuildImage from '../Images/BuildImage'
import ElevationGain from './ElevationGain'
import ElevationProfile from './ElevationProfile'
import PaceChart from './PaceChart'
import PaceExplanationModal from './PaceExplanation'
import SpeedChart from './SpeedChart'

export default class RideCharts extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      paceExplanationOpen: false
    }
    this.setPaceModalOpen = this.setPaceModalOpen.bind(this)

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

    const paceBuckets = [
      {x: 1, min: 0, max: 4, distance: 0, time: 0, color: speedGradient(0), label: "Walk"},
      {x: 2, min: 4, max: 8, distance: 0, time: 0, color: speedGradient(3), label: "Trot"},
      {x: 3, min: 8, max: 15, distance: 0, time: 0, color: speedGradient(5), label: "Canter"},
      {x: 4, min: 15, max: 1000, distance: 0, time: 0, color: speedGradient(10), label: "Gallop"}
    ]

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

        for (let paceBucket of paceBuckets) {
          if (mph > paceBucket.min && mph < paceBucket.max) {
            paceBucket.distance += distance
            paceBucket.time += timeDiff
          }
        }

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
    return {
      pace: paceBuckets,
      speed: parsedData
    }
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
    let speedData = this.memoizedParse(this.props.rideCoordinates.get('rideCoordinates')).speed
    if (speedData.length >= 2) {
      speedChart = (
        <SpeedChart
          speedData={speedData}
        />
      )
    }
    return container(speedChart)
  }

  paceChart () {
    let container = function (child) {
      return (
        <Card>
          <CardItem header>
            <View style={{position: 'absolute', right: 10, top: 10}}>
              <TouchableOpacity onPress={this.setPaceModalOpen(true)}>
                <BuildImage
                  source={require('../../img/info.png')}
                  style={{height: 30, width: 30}}
                />
              </TouchableOpacity>
            </View>
            <Text style={{fontSize: 20}}>Pace</Text>
          </CardItem>
          <CardItem cardBody style={{marginLeft: 20, marginRight: 20}}>

            { child }
          </CardItem>
        </Card>
      )
    }.bind(this)
    let paceChart = (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300}}>
        <Text>Not enough data for pace chart.</Text>
      </View>
    )
    let speedData = this.memoizedParse(this.props.rideCoordinates.get('rideCoordinates')).pace
    if (speedData.length >= 2) {
      paceChart = (
        <PaceChart
          speedData={speedData}
        />
      )
    }
    return container(paceChart)
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

  setPaceModalOpen(val) {
    return () => {
      this.setState({
        paceExplanationOpen: val
      })
    }
  }

  render () {
    return (
      <ScrollView>
        <PaceExplanationModal
          modalOpen={this.state.paceExplanationOpen}
          closeModal={this.setPaceModalOpen(false)}
        />
        { this.paceChart() }
        { this.speedChart() }
        { this.props.rideElevations ? this.elevationProfile() : null}
        { this.props.rideElevations ? this.elevationGain() : null}
      </ScrollView>
    )
  }
}

