import { fromJS, Map } from 'immutable'
import React, { PureComponent } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { darkGrey }  from '../../colors'
import { userName } from '../../modelHelpers/user'
import Thumbnail from '../Images/Thumbnail'
import DuplicateModal from './DuplicateModal'

const { width } = Dimensions.get('window')

export default class FollowList extends PureComponent {
  constructor (props) {
    super(props)
    this.renderResult = this.renderResult.bind(this)
  }

  renderResult ({item}) {
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={{height: 80}}
          onPress={this.props.onPress(fromJS(item))}
        >
          <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: darkGrey, padding: 20}}>
            <View style={{flex: 1, justifyContent:'center'}}>
              <Thumbnail
                source={{uri: this.props.userPhotos.getIn([item.profilePhotoID, 'uri'])}}
                emptySource={require('../../img/emptyProfile.png')}
                empty={!this.props.userPhotos.get(item.profilePhotoID)}
                height={width / 7}
                width={width/ 7}
                round={true}
              />
            </View>
            <View style={{flex: 3, justifyContent: 'center'}}>
              <Text>{userName(Map(item))}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <DuplicateModal
          duplicateModalYes={this.props.duplicateModalYes}
          modalOpen={this.props.duplicateModalOpen}
          closeModal={this.props.closeDuplicateModal}
        />
        <ScrollView style={{flex: 1}}>
          <FlatList
            keyExtractor={(u) => u._id}
            containerStyle={{marginTop: 0}}
            data={this.props.users.toJS()}
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
})
