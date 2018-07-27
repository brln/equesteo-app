import React, { PureComponent } from 'react';
import {
  Card,
  CardItem,
} from 'native-base';
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { darkBrand } from '../../colors'
import { getMonday, getFirstOfMonth, getFirstOfYear } from '../../helpers'

const { width } = Dimensions.get('window')
const columnWidth = (width / 4) - 20

export default class TrainingCard extends PureComponent {
  constructor (props) {
    super(props)
    this.calcs = this.calcs.bind(this)
  }

  calcs () {
    const today = new Date()
    const thisMonday = getMonday(today)
    const firstOfMonth = getFirstOfMonth(today)
    const firstOfYear = getFirstOfYear(today)
    const data = {
      rides: {
        thisWeek: 0,
        thisMonth: 0,
        thisYear: 0,
        allTime: 0
      },
      miles: {
        thisWeek: 0,
        thisMonth: 0,
        thisYear: 0,
        allTime: 0
      },
      hours: {
        thisWeek: 0,
        thisMonth: 0,
        thisYear: 0,
        allTime: 0
      }
    }

    for (let ride of this.props.rides)  {
      const rideStart = new Date(ride.get('startTime'))
      if (rideStart > thisMonday) {
        data.rides.thisWeek += 1
        data.miles.thisWeek += ride.get('distance')
        data.hours.thisWeek += ride.get('elapsedTimeSecs') / 60
      }

      if (rideStart > firstOfMonth) {
        data.rides.thisMonth += 1
        data.miles.thisMonth += ride.get('distance')
        data.hours.thisMonth += ride.get('elapsedTimeSecs') / 60
      }

      if (rideStart > firstOfYear) {
        data.rides.thisYear += 1
        data.miles.thisYear += ride.get('distance')
        data.hours.thisYear += ride.get('elapsedTimeSecs') / 60
      }

      data.rides.allTime += 1
      data.miles.allTime += ride.get('distance')
      data.hours.allTime += ride.get('elapsedTimeSecs') / 60
    }
    return data
  }

  render() {

    const calcs = this.calcs()
    return (
      <Card style={{flex: 1}}>
        <CardItem header style={{padding: 5}}>
          <View style={{paddingLeft: 5}}>
            <Text style={{color: darkBrand}}>Training</Text>
          </View>
        </CardItem>
        <CardItem cardBody style={{marginLeft: 20, marginBottom: 30, marginRight: 20, flex: 1}}>
          <View style={{flex: 1, paddingTop: 20}}>
            <View style={{flex: 1, flexDirection: 'row', paddingBottom: 10}}>
              <View style={styles.columnHeader} />
              <View style={styles.columnHeader}>
                <Text>Rides</Text>
              </View>
              <View style={styles.columnHeader}>
                <Text>Miles</Text>
              </View>
              <View style={styles.columnHeader}>
                <Text>Hours</Text>
              </View>
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={styles.trainingCell}>
                <Text>This Week</Text>
              </View>
              <View style={styles.trainingCell}>
                <Text style={styles.statText}>{calcs.rides.thisWeek}</Text>
              </View>
              <View style={styles.trainingCell}>
                <Text style={styles.statText}>{calcs.miles.thisWeek.toFixed(1)}</Text>
              </View>
              <View style={styles.trainingCell}>
                <Text style={styles.statText}>{calcs.hours.thisWeek.toFixed(1)}</Text>
              </View>
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={styles.trainingCell}>
                  <Text>This Month</Text>
                </View>
                <View style={styles.trainingCell}>
                  <Text style={styles.statText}>{calcs.rides.thisMonth}</Text>
                </View>
                <View style={styles.trainingCell}>
                  <Text style={styles.statText}>{calcs.miles.thisMonth.toFixed(1)}</Text>
                </View>
                <View style={styles.trainingCell}>
                  <Text style={styles.statText}>{calcs.hours.thisMonth.toFixed(1)}</Text>
                </View>
              </View>
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={styles.trainingCell}>
                  <Text>This Year</Text>
                </View>
                <View style={styles.trainingCell}>
                  <Text style={styles.statText}>{calcs.rides.thisYear}</Text>
                </View>
                <View style={styles.trainingCell}>
                  <Text style={styles.statText}>{calcs.miles.thisYear.toFixed(1)}</Text>
                </View>
                <View style={styles.trainingCell}>
                  <Text style={styles.statText}>{calcs.hours.thisYear.toFixed(1)}</Text>
                </View>
              </View>
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={styles.trainingCell}>
                  <Text>All Time</Text>
                </View>
                <View style={styles.trainingCell}>
                  <Text style={styles.statText}>{calcs.rides.allTime}</Text>
                </View>
                <View style={styles.trainingCell}>
                  <Text style={styles.statText}>{calcs.miles.allTime.toFixed(1)}</Text>
                </View>
                <View style={styles.trainingCell}>
                  <Text style={styles.statText}>{calcs.hours.allTime.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          </View>
        </CardItem>
      </Card>
    )
  }
}

const styles = StyleSheet.create({
  columnHeader: {
    width: columnWidth,
    alignItems: 'center'
  },
  trainingCell: {
    width: columnWidth,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statText: {
    fontSize: 20,
    fontWeight: 'bold'
  }
});
