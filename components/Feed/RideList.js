import React, { PureComponent } from 'react'
import {
  SectionList,
  StyleSheet,
} from 'react-native';


import { getMonday, logInfo } from '../../helpers'
import HorseCard from './HorseCard'
import RideCard from './RideCard'
import SectionHeader from './SectionHeader'


export default class RideList extends PureComponent {
  constructor (props) {
    super(props)
    this.getHorse = this.getHorse.bind(this)
    this.getUserProfilePhotoURL = this.getUserProfilePhotoURL.bind(this)
    this.getUser = this.getUser.bind(this)
    this._renderCard = this._renderCard.bind(this)
  }

  getUser (item) {
    if (!item.get('userID')) {
      throw Error(`Item does not have userID: ${item.get('type')} ${item.get('_id')}` )
    }
    const user = this.props.users.get(item.get('userID'))
    if (!user) {
      logInfo(item.get('userID'))
      logInfo(this.props.users.toJSON())
      throw Error('User does not exist.')
    }
    return user
  }

  getUserProfilePhotoURL (item) {
    const foundUser = this.getUser(item)
    const profilePhotoID = foundUser.get('profilePhotoID')
    let profilePhotoURL = null
    if (profilePhotoID) {
      profilePhotoURL = foundUser.getIn(['photosByID', profilePhotoID, 'uri'])
    }
    return profilePhotoURL
  }

  getHorse (ride) {
    return this.props.horses.filter((h) => h.get('_id') === ride.get('horseID')).get(0)
  }

  _renderCard ({item}) {
    if (item.get('type') === 'ride') {
      const childFilter = (item) => {
        return (r) => {
          return r.get('rideID') === item.get('_id') && r.get('deleted') === false
        }
      }
      return (
        <RideCard
          horse={this.getHorse(item)}
          navigator={this.props.navigator}
          ownRideList={this.props.ownRideList}
          ride={item}
          rideCarrots={this.props.rideCarrots.filter(childFilter(item))}
          rideComments={this.props.rideComments.filter(childFilter(item))}
          showComments={this.props.showComments}
          showRide={this.props.showRide}
          toggleCarrot={this.props.toggleCarrot}
          rideUser={this.getUser(item)}
          userProfilePhotoURL={this.getUserProfilePhotoURL(item)}
          userID={this.props.userID}
          users={this.props.users}
        />
      )
    } else if (item.get('type') === 'horse') {
      return (
        <HorseCard
          horse={item}
          navigator={this.props.navigator}
          horseUser={this.getUser(item)}
          userID={this.props.userID}
          userProfilePhotoURL={this.getUserProfilePhotoURL(item)}
        />
      )
    } else {
      return null
    }
  }

  _makeSections () {
    const rideWeeks = {}
    const existingHorses = this.props.horses.filter((h) => {
      return h.get('deleted') !== true
        && (
          !this.props.ownRideList ||
          (this.props.ownRideList && h.get('userID') === this.props.userID)
        )

    })

    const ridesAndHorses = this.props.rides.concat(existingHorses).sort((a, b) => {
      let aVal
      let bVal
      if (a.get('type') === 'horse') {
        aVal = a.get('createTime')
      } else if (a.get('type') === 'ride') {
        aVal = a.get('startTime')
      }

      if (b.get('type') === 'horse') {
        bVal = b.get('createTime')
      } else if (b.get('type') === 'ride') {
        bVal = b.get('startTime')
      }
      return bVal - aVal
    })

    for (let rideOrHorse of ridesAndHorses) {
      let monday
      if (rideOrHorse.get('type') === 'ride') {
        monday = getMonday(rideOrHorse.get('startTime'))
      } else if (rideOrHorse.get('type') === 'horse' && rideOrHorse.get('createTime')) {
        monday = getMonday(rideOrHorse.get('createTime'))
      }
      else { continue }

      if (!rideWeeks[monday]) {
        rideWeeks[monday] = []
      }
      rideWeeks[monday].push(rideOrHorse)
    }
    const weeks = Object.keys(rideWeeks).sort((a, b) => b - a)
    return weeks.map((w) => {
      return {
        title: w,
        data: rideWeeks[w]
      }
    })
  }

  _renderSectionHeader ({section: {title}}) {
    return <SectionHeader title={title} />
  }

  render() {
    return (
      <SectionList
        containerStyle={{marginTop: 0}}
        initialNumToRender={3}
        keyExtractor={(item) => item.get('_id')}
        maxToRenderPerBatch={2}
        onRefresh={this.props.startRefresh}
        refreshing={this.props.refreshing}
        renderItem={this._renderCard}
        renderSectionHeader={this._renderSectionHeader}
        sections={this._makeSections()}
      />
    )
  }
}

const styles = StyleSheet.create({
  rideTitle: {
    fontSize: 24
  }
});
