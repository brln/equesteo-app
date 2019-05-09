import moment from 'moment'
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

import EventListRow from './EventListRow'

const { width, height } = Dimensions.get('window')

export default class EventList extends PureComponent {
  constructor (props) {
    super(props)
    this.renderResult = this.renderResult.bind(this)
  }

  renderResult ({item}) {
    return (
      <EventListRow
        careEvent={item.careEvent}
        horses={item.horses}
        horseOwnerIDs={this.props.horseOwnerIDs}
        horsePhotos={this.props.horsePhotos}
        openCareEvent={this.props.openCareEvent}
        showHorseProfile={this.props.showHorseProfile}
      />
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={{flex: 1}}>
          <FlatList
            keyExtractor={(u) => u.careEvent._id}
            containerStyle={{marginTop: 0}}
            data={this.props.careEvents}
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
