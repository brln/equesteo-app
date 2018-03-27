import React, { Component } from 'react';
import { Container, Tab, Tabs } from 'native-base';
import {
  StyleSheet,
} from 'react-native';
import Following from './Following'
import You from './You'

export default class Feed extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }


  render() {
    return (
      <Container>
        <Tabs initialPage={0}>
          <Tab heading="Following">
            <Following
              horses={this.props.horses}
              rides={this.props.followingRides}
            />
          </Tab>
          <Tab heading="You">
            <You
              horses={this.props.horses}
              rides={this.props.yourRides}
            />
          </Tab>
        </Tabs>
      </Container>
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
