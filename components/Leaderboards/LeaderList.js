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
import { metersToFeet } from '../../helpers'
import { STAT_DISTANCE, STAT_TIME, STAT_ASCENT } from "./Leaderboards"
import { userName } from '../../modelHelpers/user'
import Thumbnail from '../Images/Thumbnail'

const { width } = Dimensions.get('window')

export default class LeaderList extends PureComponent {
  constructor (props) {
    super(props)
    this.renderResult = this.renderResult.bind(this)
    this.showProfile = this.showProfile.bind(this)
    this.stat = this.stat.bind(this)
  }

  showProfile (showUser) {
    return () => {
      this.props.showProfile(showUser)
    }
  }

  showHorseProfile (showHorse) {
    return () => {
      const ownerID = this.props.horseOwnerIDs.get(showHorse.get('_id'))
      this.props.showHorseProfile(showHorse, ownerID)
    }
  }

  stat (item) {
    const value = item[this.props.selectedStat]
    switch(this.props.selectedStat) {
      case STAT_DISTANCE:
        return `${value.toFixed(1)} mi`
      case STAT_TIME:
        const hours = value / 3600
        const justHours = Math.floor(hours)
        const minutes = Math.round((hours - justHours) * 60)
        if (justHours > 0) {
          return `${justHours}h ${minutes}m`
        } else {
          return `${minutes}m`
        }
      case STAT_ASCENT:
        return `${Math.round(metersToFeet(value))} ft`
      default:
        throw Error('not a possible stat')
    }
  }

  renderResult ({item, index}) {
    const rider = this.props.users.get(item.riderID)
    const horse = this.props.horses.get(item.horseID)
    return (
      <View style={{flex: 1}}>
        <View
          style={{height: 80}}
        >
          <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: darkGrey, padding: 10}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent:'center', alignItems: 'center'}}>
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontSize: 20}}>{index + 1}</Text>
              </View>

              <View style={{flex: 5}}>
                <TouchableOpacity style={{flex: 1}} onPress={this.showProfile(rider)}>
                  <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                    <Thumbnail
                      source={{uri: this.props.userPhotos.getIn([rider.get('profilePhotoID'), 'uri'])}}
                      emptySource={require('../../img/emptyProfile.png')}
                      empty={!this.props.userPhotos.get(rider.get('profilePhotoID'))}
                      height={width / 12}
                      width={width/ 12}
                      round={true}
                    />
                    <Text style={{paddingLeft: 3}}>{rider ? userName(rider) : item.riderID}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={{flex: 1}} onPress={this.showHorseProfile(horse)}>
                  <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                    { horse ? <Thumbnail
                      source={{uri: this.props.horsePhotos.getIn([horse.get('profilePhotoID'), 'uri'])}}
                      emptySource={require('../../img/horseProfile.png')}
                      empty={!this.props.horsePhotos.get(horse.get('profilePhotoID'))}
                      height={width / 12}
                      width={width/ 12}
                      round={true}
                      borderColor={horse.get('color') || null}
                    /> : null }
                    <Text style={{paddingLeft: 3}}>{horse ? horse.get('name') : item.horseID}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={{flex: 2}}>
                <Text>{this.stat(item)}</Text>
              </View>

            </View>
          </View>
        </View>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={{flex: 1, borderTopWidth: 2, borderTopColor: darkGrey}}>
          <FlatList
            keyExtractor={(u) => u.riderID + u.horseID}
            containerStyle={{marginTop: 0}}
            data={this.props.dataset.toJS()}
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
