import React, { Component } from 'react';
import { ListItem } from 'react-native-elements'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { profilePhotoURL } from "../helpers"
import { PROFILE } from '../screens'

export default class Following extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchPhrase: null
    }
    this.changeSearchPhrase = this.changeSearchPhrase.bind(this);
    this.search = this.search.bind(this)
    this.showProfile = this.showProfile.bind(this)
  }

  changeSearchPhrase (phrase) {
    this.setState({
      searchPhrase: phrase
    })
  }

  search () {
    this.props.search(this.state.searchPhrase)
  }

  showProfile (user) {
    let name = 'Unknown Name'
    if (user.firstName || user.lastName) {
      name = `${user.firstName} ${user.lastName}`
    }

    this.props.navigator.push({
      screen: PROFILE,
      title: name,
      animationType: 'slide-up',
      passProps: {
        user,
      }
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={{flex: 1}}>
          <Text>Find New People:</Text>
          <TextInput
            autoFocus={true}
            onChangeText={this.changeSearchPhrase}
            onSubmitEditing={this.search}
          />
          <View containerStyle={{marginTop: 0}}>
            {
              this.props.userSearchResults.map((user, i) => (
                <ListItem
                  key={i}
                  title={user.email}
                  roundAvatar
                  avatar={{uri: profilePhotoURL(user.profilePhotoID)}}
                  onPress={() => { this.showProfile(user) }}
                />
              ))
            }
          </View>
        </ScrollView>
        <ScrollView style={{flex: 1}}>
          <Text>Currently Following:</Text>
          <View containerStyle={{marginTop: 0}}>
            {
              this.props.userData.following.map((user, i) => (
                <ListItem
                  key={i}
                  title={user.email}
                  roundAvatar
                  avatar={{uri: profilePhotoURL(user.profilePhotoID)}}
                  onPress={() => { this.showProfile(user) }}
                />
              ))
            }
          </View>
        </ScrollView>
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
    width: '100%'
  },
});
