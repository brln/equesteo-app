import React, { Component } from 'react'
import { Button, Content, Card, CardItem, Icon, Left, ListItem, Right, Text } from 'native-base';
import moment from 'moment'
import {
  Image,
  StyleSheet,
} from 'react-native';

export default class RideCard extends Component {
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
                source={{uri: `https://s3.amazonaws.com/equesteo-ride-map-images/${this.props.ride.mapImageID}.jpeg`}}
                style={{height: 200, width: null, flex: 1}}
              />
            </CardItem>
            <CardItem footer>
              <Left>
                <Button transparent>
                  <Icon active name="thumbs-up" />
                  <Text>45 Likes</Text>
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
