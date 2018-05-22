import React, { Component } from 'react'
import {
  Button,
  Content,
  Card,
  CardItem,
  Icon,
  Left,
  ListItem,
  Right,
  Text
} from 'native-base';
import {
  Image,
  StyleSheet,
} from 'react-native';

import { staticMap } from '../../helpers'

export default class RideCard extends Component {
  constructor (props) {
    super(props)
    this.toggleCarrot = this.toggleCarrot.bind(this)
  }

  toggleCarrot () {
    this.props.toggleCarrot(this.props.ride._id)
  }

  render() {
    return (
      <ListItem
        onPress={() => {this.props.showRide(this.props.ride)}}
      >
        <Content>
          <Card>
            <CardItem header>
              <Text>{this.props.ride.name}</Text>
            </CardItem>
            <CardItem cardBody>
              <Image
                source={{uri: staticMap(this.props.ride)}}
                style={{height: 200, width: null, flex: 1}}
              />
            </CardItem>
            <CardItem footer>
              <Left>
                <Button transparent onPress={this.toggleCarrot}>
                  <Icon active name="thumbs-up" />
                  <Text>{this.props.rideCarrots.length} Carrots</Text>
                </Button>
              </Left>
              <Right>
                <Button transparent>
                  <Icon active name="chatbubbles" />
                  <Text>77 comments</Text>
                </Button>
              </Right>
            </CardItem>
          </Card>
        </Content>
      </ListItem>
    )
  }
}

const styles = StyleSheet.create({
  rideTitle: {
    fontSize: 24
  }
});
