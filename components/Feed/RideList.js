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
    this._makeSections = this._makeSections.bind(this)
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

  getUserProfilePhotoURL (user) {
    const profilePhotoID = user.get('profilePhotoID')
    let profilePhotoURL = null
    if (profilePhotoID) {
      profilePhotoURL = user.getIn(['photosByID', profilePhotoID, 'uri'])
    }
    return profilePhotoURL
  }

  getHorse (ride) {
    return this.props.horses.get(ride.get('horseID'))
  }

  _renderCard ({item}) {
    if (item.type === 'ride') {
      const childFilter = (item) => {
        return (r) => {
          return r.get('rideID') === item.get('_id') && r.get('deleted') === false
        }
      }
      const horse = this.getHorse(item.childData)
      let ownerID = horse ? this.props.horseOwnerIDs.get(horse.get('_id')) : null
      return (
        <RideCard
          horse={horse}
          ownRideList={this.props.ownRideList}
          ownerID={ownerID}
          ride={item.childData}
          rideCarrots={this.props.rideCarrots.filter(childFilter(item.childData))}
          rideComments={this.props.rideComments.filter(childFilter(item.childData))}
          showComments={this.props.showComments}
          showHorseProfile={this.props.showHorseProfile}
          showProfile={this.props.showProfile}
          showRide={this.props.showRide}
          toggleCarrot={this.props.toggleCarrot}
          rideUser={item.itemUser}
          userProfilePhotoURL={this.getUserProfilePhotoURL(item.itemUser)}
          userID={this.props.userID}
          users={this.props.users}
        />
      )
    } else if (item.type === 'horse') {
      return (
        <HorseCard
          horse={item.childData}
          ownerID={this.props.horseOwnerIDs.get(item.childData.get('_id'))}
          rider={item.itemUser}
          showHorseProfile={this.props.showHorseProfile}
          showProfile={this.props.showProfile}
          userID={this.props.userID}
          userProfilePhotoURL={this.getUserProfilePhotoURL(item.itemUser)}
        />
      )
    } else {
      return null
    }
  }

  _makeSections () {
    const allFeedItems = []
    for (let horseUser of this.props.horseUsers.valueSeq()) {
      const horse = this.props.horses.get(horseUser.get('horseID'))
      if (!horse) {
        throw Error("Should have a horse here.")
      }
      if (horse.get('deleted') !== true
        && (
          !this.props.ownRideList ||
          (this.props.ownRideList && horseUser.get('userID') === this.props.userID)
        )) {
          const rider = this.props.users.get(horseUser.get('userID'))
          allFeedItems.push(
            new FeedItem(
              horse,
              horseUser.get('createTime'),
              rider,
              'horse',
              horseUser.get('_id')
            )
          )
        }
    }

    for (let ride of this.props.rides) {
      const user = this.getUser(ride)
      allFeedItems.push(new FeedItem(ride, ride.get('startTime'), user, 'ride', ride.get('_id')))
    }

    allFeedItems.sort((a, b) => b.sortTime - a.sortTime)

    const rideWeeks = {}
    for (let feedItem of allFeedItems) {
      let monday = getMonday(feedItem.sortTime)
      if (!rideWeeks[monday]) {
        rideWeeks[monday] = []
      }
      rideWeeks[monday].push(feedItem)
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
        keyExtractor={(item) => item.key}
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

class FeedItem {
  // A wrapper around the objects that are showing up in the feed,
  // i.e. rides and horses for now.
  constructor (childData, sortTime, itemUser, type, key) {
    this.childData = childData
    this.sortTime = sortTime
    this.itemUser = itemUser
    this.type = type
    this.key = key
  }
}

const styles = StyleSheet.create({
  rideTitle: {
    fontSize: 24
  }
});
