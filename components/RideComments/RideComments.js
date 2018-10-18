import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import BuildImage from '../BuildImage'
import { logError } from '../../helpers'
import MultiPlatform from '../../components/MultiPlatform'
import CommentList from './CommentList'

export default class RideComments extends MultiPlatform {
  constructor (props) {
    super(props)
    this.scrollable = null
  }

  componentDidUpdate (nextProps) {
    if (this.props.rideComments !== nextProps.rideComments) {
      setTimeout(() => {
        this.scrollable.scrollToEnd({animated: true})
      }, 300)
    }
  }

  renderIOS () {
    return (
      <KeyboardAvoidingView keyboardVerticalOffset={54} behavior={'height'} style={styles.container}>
        {this.renderChildren()}
      </KeyboardAvoidingView>
    )
  }

  renderAndroid () {
    return (
      <View style={styles.container}>
        {this.renderChildren()}
      </View>
    )
  }

  renderChildren() {
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 5}}>
          <ScrollView
            style={{flex: 1}}
            ref={(i) => this.scrollable = i}
          >
            <CommentList
              rideComments={this.props.rideComments}
              users={this.props.users}
            />
          </ScrollView>
        </View>
        <View style={{flex: 1, backgroundColor: 'white', width: '100%', elevation: 20, minHeight: 100}}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 5, paddingLeft: 20, paddingRight: 20, paddingTop: 5, paddingBottom: 5}}>
              <TextInput
                style={{
                  textAlignVertical: "top"
                }}
                autoFocus={true}
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
