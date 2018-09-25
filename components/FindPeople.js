import { fromJS } from 'immutable'
import React, { PureComponent } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  Button,
  Header,
  Icon,
  Input,
  Item,
  Thumbnail,
} from 'native-base'

import { brand, darkGrey }  from '../colors'

export default class FindPeople extends PureComponent {
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
      this.props.showProfile(fromJS(profileUser))
    }
  }

  renderResult ({item}) {
    let avatar
    if (item.photosByID[item.profilePhotoID]) {
      avatar = <Thumbnail size={30} source={{uri: item.photosByID[item.profilePhotoID]}.uri} />
    } else {
      avatar = <Thumbnail size={30} source={require('../img/emptyProfile.png')} />
    }

    return (
      <View style={{flex: 1, borderBottomWidth: 1, borderColor: darkGrey}}>
        <TouchableOpacity
          style={{height: 80}}
          onPress={this.showProfile(item)}
        >
          <View style={{flex: 1, flexDirection: 'row', paddingLeft: 20}}>
            <View style={{flex: 1, justifyContent:'center'}}>
              { avatar }
            </View>
            <View style={{flex: 3, justifyContent: 'center'}}>
              <Text>{`${item.firstName || ''} ${item.lastName || ''}`}</Text>
            </View>
          </View>

        </TouchableOpacity>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={{flex: 1}}>
          <Header searchBar iosBarStyle="light-content" style={{backgroundColor: brand}}>
            <Item style={{backgroundColor: 'white', height: 40}}>
              <Icon name="ios-search" />
              <Input
                autoFocus={true}
                onChangeText={this.changeSearchPhrase} // <-- Here
                onSubmitEditing={this.search}
                placeholder="Search by name"
              />
              <Icon name="ios-people" />
            </Item>
          </Header>
          <FlatList
            keyExtractor={(u) => u._id}
            containerStyle={{marginTop: 0}}
            data={this.props.userSearchResults.filter(u => u.get('_id') !== this.props.user.get('_id')).toJS()}
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
