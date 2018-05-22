import React, { Component } from 'react'
import {
  FlatList,
  StyleSheet,
} from 'react-native';
import RideCard from './RideCard'


export default class Following extends Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  startRefresh () {
    this.setState({
      refreshing: true
    })
  }

  render() {
    return (
      <FlatList
        containerStyle={{marginTop: 0}}
        data={this.props.rides}
        keyExtractor={(item) => item._id}
        onRefresh={this.props.startRefresh}
        refreshing={this.props.refreshing}
        renderItem={({item}) => {
          const ride = item
          return (<RideCard
            ride={ride}
            rideCarrots={this.props.rideCarrots.filter((rc) => rc.rideID === ride._id && rc.deleted === false)}
            showRide={this.props.showRide}
            toggleCarrot={this.props.toggleCarrot}
          />)
        }}
      />
    )
  }
}

const styles = StyleSheet.create({
  rideTitle: {
    fontSize: 24
  }
});
