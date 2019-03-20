import React, { PureComponent } from 'react';
import {
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import BuildImage from '../Images/BuildImage'
import { lightGrey } from '../../colors'
import { logError } from '../../helpers'
import CommentList from './CommentList'

const { width } = Dimensions.get('window')

export default class RideComments extends PureComponent {
  constructor (props) {
    super(props)
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: 1, borderTopWidth: 2, borderTopColor: lightGrey}}>
          <CommentList
            rideComments={this.props.rideComments}
            showProfile={this.props.showProfile}
            users={this.props.users}
            userPhotos={this.props.userPhotos}
          />
          <View style={{flex: 1, backgroundColor: 'white', width, elevation: 20, minHeight: 100}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 5, paddingLeft: 20, paddingRight: 20, paddingTop: 5, paddingBottom: 5}}>
                <TextInput
                  style={{
                    textAlignVertical: "top"
                  }}
                  multiline={true}
                  placeholder={"Add a comment"}
                  onChangeText={this.props.updateNewComment}
                  value={this.props.newComment}
                  underlineColorAndroid={'transparent'}
                  maxLength={2000}
                />
              </View>
              <TouchableOpacity
                style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
                onPress={this.props.submitComment}
              >
                <BuildImage
                  style={{height: 50, width: 50}}
                  source={require('../../img/caretRight.png')}
                  onError={(e) => { logError('there was an error loading RideComments image') }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
});
