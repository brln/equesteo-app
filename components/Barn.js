import React, { Component } from 'react';
import { Navigation } from 'react-native-navigation'
import { List, ListItem } from 'react-native-elements'

import {
  StyleSheet,
  Text,
  View
} from 'react-native';


export default class Barn extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.newHorse = this.newHorse.bind(this)
    this.saveNewHorse = this.saveNewHorse.bind(this)
  }

  newHorse () {
    Navigation.showModal({
      screen: 'equesteo.NewHorse',
      title: 'New Horse',
      animationType: 'slide-up',
      passProps: {
        saveNewHorse: this.saveNewHorse
      }
    })
  }

  saveNewHorse (horseData) {
    Navigation.dismissModal({
      animationType: 'slide-down'
    })
    this.props.saveNewHorse(horseData)
  }

  render() {
    return (
      <View>
        <Text style={styles.header}>Horses:</Text>
        <List containerStyle={{marginTop: 0}}>
          {
            [...this.props.horses.map((horse, i) => (
              <ListItem
                key={i}
                title={horse.name}
              />
            )),
              <ListItem
                key="add-horse"
                title={'Add New Horse'}
                onPress={this.newHorse}
              />
            ]
          }
        </List>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  header: {
    padding: 20,
    fontSize: 24,
    fontWeight: 'bold'
  }
});