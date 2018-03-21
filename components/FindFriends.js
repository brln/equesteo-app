import React, { Component } from 'react';
import { List, ListItem } from 'react-native-elements'

import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { profilePhotoURL } from "../helpers"



export default class FindFriends extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchPhrase: null
    }
    this.changeSearchPhrase = this.changeSearchPhrase.bind(this);
    this.search = this.search.bind(this)
  }

  changeSearchPhrase (phrase) {
    this.setState({
      searchPhrase: phrase
    })
  }

  search () {
    this.props.search(this.state.searchPhrase)
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Search:</Text>
        <TextInput
          autoFocus={true}
          onChangeText={this.changeSearchPhrase}
          onSubmitEditing={this.search}
        />
        <ScrollView>
          <List containerStyle={{marginTop: 0}}>
            {
              this.props.userSearchResults.map((user, i) => (
                <ListItem
                  key={i}
                  title={user.email}
                  roundAvatar
                  avatar={{uri: profilePhotoURL(user.profilePhotoID)}}
                />
              ))
            }
          </List>
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
