import React, { PureComponent } from 'react'
import {
  ScrollView,
  Text,
  View,
} from 'react-native'
import {
  Card,
  CardItem,
} from 'native-base'

import { brand, darkBrand } from '../../colors'
import Button from '../Button'
import TimeChart from './TimeChart'

export default class Charts extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      showDays: 30
    }
    this.setDays = this.setDays.bind(this)
  }

  setDays (days) {
    return () => {
      this.setState({
        showDays: days,
      })
    }
  }

  render() {
    return (
      <ScrollView>
        <View style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: 20,
          paddingRight: 20,
        }}>
          <Text style={{fontSize: 20}}>Days</Text>
          <Button
            color={this.state.showDays === 7 ? darkBrand : brand}
            onPress={this.setDays(7)}
            text={'7'}
          />
          <Button
            color={this.state.showDays === 30 ? darkBrand : brand}
            onPress={this.setDays(30)}
            text='30'
          />
          <Button
            color={this.state.showDays === 90 ? darkBrand : brand}
            onPress={this.setDays(90)}
            text='90'
          />
          <Button
            color={this.state.showDays === 365 ? darkBrand : brand}
            onPress={this.setDays(365)}
            text='365'
          />
        </View>

      <Card>
        <CardItem cardBody>
          <TimeChart
            chosenType={this.props.chosenType}
            chosenHorseID={this.props.chosenHorseID}
            chosenUserID={this.props.chosenUserID}
            horses={this.props.horses}
            rideHorses={this.props.rideHorses}
            rideShouldShow={this.props.rideShouldShow}
            showDays={this.state.showDays}
            trainings={this.props.trainings}
            types={this.props.types}
          />
        </CardItem>
      </Card>

      </ScrollView>
    )
  }
}
