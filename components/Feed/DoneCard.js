import React, { PureComponent } from 'react'
import {
  Card,
  CardItem,
  Text,
} from 'native-base'
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import { darkBrand } from '../../colors'

export default class DoneCard extends PureComponent {
  render() {
    return (
      <Card>
        <CardItem>
          <View style={{flex: 1}}>
            <TouchableOpacity style={styles.cardHeaderTouch} onPress={this.props.openTraining}>
              <Text style={{textAlign: 'center'}}>To see older rides, visit your </Text>
              <Text style={{textAlign: 'center', textDecorationLine: 'underline', color: darkBrand}}>Training Page</Text>
              <Text style={{textAlign: 'center'}}>.</Text>
            </TouchableOpacity>
          </View>
        </CardItem>
      </Card>
    )
  }
}

const styles = StyleSheet.create({
  rideTitle: {
    fontSize: 24
  },
  cardHeaderTouch: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  }
});

