import { Map } from 'immutable'
import React, { Component } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import {
  Body,
  Left,
  ListItem,
  Thumbnail,
} from 'native-base'

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
    this.renderResult = this.renderResult.bind(this)
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
    return () => {
      const madeImmutable = Map(profileUser).set('photosByID', Map(profileUser.photosByID))
      this.props.navigator.push({
        screen: PROFILE,
        animationType: 'slide-up',
        passProps: {
          profileUser: madeImmutable,
        }
      })
    }
  }

  renderResult ({item}) {
    return (
      <ListItem avatar noBorder={true} style={{height: 80}} onPress={this.showProfile(item)}>
        <Left>
          <Thumbnail size={30} source={{uri: item.photosByID[item.profilePhotoID]}.uri} />
        </Left>
        <Body>
          <Text>{`${item.firstName} ${item.lastName}`}</Text>
        </Body>
      </ListItem>
    )
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
          <FlatList
            keyExtractor={(u) => u._id}
            containerStyle={{marginTop: 0}}
            data={this.props.userSearchResults.filter(u => u._id !== this.props.user.get('_id'))}
            renderItem={this.renderResult}
          />
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
