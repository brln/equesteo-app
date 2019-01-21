import React, { PureComponent } from 'react';
import {
  Card,
  CardItem,
} from 'native-base';
import {
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { darkBrand } from '../../colors'

export default class FollowersCard extends PureComponent {
  render() {
    if (this.props.visible) {
      return (
        <Card>
          <CardItem>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
              <View style={{flex: 1}} />
              <TouchableOpacity
                onPress={this.props.showUserList(this.props.followers, 'followerID')}
                style={{flex: 2, paddingLeft: 5, flexDirection: 'row', alignItems: 'center'}}
              >
                <Text style={{color: darkBrand, paddingRight: 10}}>Followers:</Text>
                <Text style={{fontSize: 24}}>{this.props.followers.count()}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.props.showUserList(this.props.followings, 'followingID')}
                style={{flex: 2, paddingLeft: 5, flexDirection: 'row', alignItems: 'center'}}
              >
                <Text style={{color: darkBrand, paddingRight: 10}}>Following:</Text>
                <Text style={{fontSize: 24}}>{this.props.followings.count()}</Text>
              </TouchableOpacity>
              <View style={{flex: 1}} />
            </View>
          </CardItem>
        </Card>
      )
    } else {}
      return null
    }
}
