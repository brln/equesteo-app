import React, { Component } from 'react';
import { List, ListItem } from 'react-native-elements'
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

export default class Feed extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }


  render() {
    return (
      <View>
        <List containerStyle={{marginTop: 0}}>
          {
            [...this.props.rides.map((ride, i) => (
              <ListItem
                key={i}
                title={ride.name}
                subtitle={ride.userID}
              />
            )),
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
