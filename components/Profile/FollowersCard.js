import React, { PureComponent } from 'react';
import {
  Card,
  CardItem,
} from 'native-base'
import {
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import config from '../../dotEnv'

import { darkBrand } from '../../colors'

export default class FollowersCard extends PureComponent {
  render() {
    if (this.props.visible && (this.props.profileUser.get('_id') !== config.NICOLE_USER_ID || this.props.userID === config.NICOLE_USER_ID)) {
      return (
        <Card>
          <CardItem>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
              <TouchableOpacity
                onPress={this.props.showUserList(this.props.followers, 'followerID')}
                style={{flex: 2, paddingLeft: 20, flexDirection: 'row', alignItems: 'center'}}
              >
                <Text style={{color: darkBrand, paddingRight: 10}}>Followers:</Text>
                <View>
                  <Text style={{fontSize: 24}}>{this.props.followers.count()}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.props.showUserList(this.props.followings, 'followingID')}
                style={{flex: 2, paddingRight: 20, flexDirection: 'row', alignItems: 'center'}}
              >
                <Text style={{color: darkBrand, paddingRight: 10}}>Following:</Text>
                <View>
                  <Text style={{fontSize: 24}}>{this.props.followings.count()}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </CardItem>
        </Card>
      )
    } else {
      return null
    }
  }
}
