import React, { Component } from 'react'
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'

export default class Account extends Component {
  constructor (props) {
    super(props)
    this.changeFirstName = this.changeFirstName.bind(this)
    this.changeLastName = this.changeLastName.bind(this)
    this.changeAboutMe = this.changeAboutMe.bind(this)
  }

  changeFirstName (newText) {
    this.props.changeAccountDetails({
      ...this.props.userData,
      firstName: newText
    })
  }

  changeLastName (newText) {
    this.props.changeAccountDetails({
      ...this.props.userData,
      lastName: newText
    })
  }

  changeAboutMe (newText) {
    this.props.changeAccountDetails({
      ...this.props.userData,
      aboutMe: newText
    })
  }

  render() {
    return (
      <ScrollView keyboardShouldPersistTaps={'always'}>
        <View style={styles.container}>
          <View style={{flex: 1, padding: 5}}>
            <Text>First Name:</Text>
            <TextInput
              onChangeText={this.changeFirstName}
              value={this.props.userData.firstName}
            />

            <Text>Last Name:</Text>
            <TextInput
              onChangeText={this.changeLastName}
              value={this.props.userData.lastName}
            />

            <Text> About Me: </Text>
            <TextInput
              onChangeText={this.changeAboutMe}
              value={this.props.userData.aboutMe}
            />
          </View>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
});
