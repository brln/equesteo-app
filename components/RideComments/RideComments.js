import React, { PureComponent } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
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
        <View style={{flex: 1, backgroundColor: 'white', width: '100%', elevation: 20, minHeight: 40}}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{flex: 5, padding: 20}}>
              <TextInput
                autoFocus={true}
                multiline={true}
                placeholder={"Add a comment"}
                onChangeText={this.props.updateNewComment}
                value={this.props.newComment}
                underlineColorAndroid={'transparent'}
              />
            </View>
            <TouchableOpacity
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
              onPress={this.props.submitComment}
            >
              <Image
                style={{height: 50, width: 50}}
                source={require('../../img/caretRight.png')}
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
