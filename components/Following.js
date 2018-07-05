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

  showProfile (profileUser) {
    let name = 'Unknown Name'
    if (profileUser.firstName || profileUser.lastName) {
      name = `${profileUser.firstName || ''} ${profileUser.lastName || ''}`
    }

    this.props.navigator.push({
      screen: PROFILE,
      title: name,
      animationType: 'slide-up',
      passProps: {
        profileUser,
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
              this.props.userSearchResults.filter(u => u._id !== this.props.user._id).map((user, i) => (
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
