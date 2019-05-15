import memoizeOne from 'memoize-one'
import React, { PureComponent } from 'react'
import {
  SectionList,
  StyleSheet,
  Text,
} from 'react-native';


import { getMonday, logInfo } from '../../helpers'
import HorseCard from './HorseCard/HorseCard'
import RideCard from './RideCard/RideCard'
import SectionHeader from './SectionHeader'
import DoneCard from './DoneCard'


export default class RideList extends PureComponent {
  constructor (props) {
    super(props)
    this.getUserProfilePhotoURL = this.getUserProfilePhotoURL.bind(this)
    this._renderCard = this._renderCard.bind(this)

    this.memoMakeSections = memoizeOne(this.makeSections)
  }

  getUserProfilePhotoURL (user) {
    const profilePhotoID = user.get('profilePhotoID')
    let profilePhotoURL = null
    if (profilePhotoID) {
      profilePhotoURL = this.props.userPhotos.getIn([profilePhotoID, 'uri'])
    }
    return profilePhotoURL
  }

  _renderCard ({item}) {
    if (item.type === 'ride') {
      const childFilter = (item) => {
        return (r) => {
          return r.get('rideID') === item.get('_id') && r.get('deleted') !== true
        }
      }
      return (
        <RideCard
          horses={this.props.rideHorses.get(item.childData.get('_id'))}
          horseOwnerIDs={this.props.horseOwnerIDs}
          horsePhotos={this.props.horsePhotos}
          ownRideList={this.props.ownRideList}
          ride={item.childData}
          rideCarrots={this.props.rideCarrots.filter(childFilter(item.childData))}
          rideComments={this.props.rideComments.filter(childFilter(item.childData))}
          ridePhotos={this.props.ridePhotos.filter(childFilter(item.childData))}
          rideUser={item.itemUser}
          showComments={this.props.showComments}
          showHorseProfile={this.props.showHorseProfile}
          showProfile={this.props.showProfile}
          showRide={this.props.showRide}
          toggleCarrot={this.props.toggleCarrot}
          userProfilePhotoURL={this.getUserProfilePhotoURL(item.itemUser)}
          userID={this.props.userID}
          users={this.props.users}
        />
      )
    } else if (item.type === 'horse') {
      const horsePhotos = this.props.horsePhotos.filter(hp => {
        return hp.get('horseID') === item.childData.get('_id')
          && hp.get('deleted') !== true
      })
      return (
        <HorseCard
          createTime={item.sortTime}
          horse={item.childData}
          horsePhotos={horsePhotos}
          ownerID={this.props.horseOwnerIDs.get(item.childData.get('_id'))}
          rider={item.itemUser}
          showHorseProfile={this.props.showHorseProfile}
          showProfile={this.props.showProfile}
          userID={this.props.userID}
          userProfilePhotoURL={this.getUserProfilePhotoURL(item.itemUser)}
        />
      )
    } else if (item.type === 'endItem') {
      return (
        <DoneCard
          openTraining={this.props.openTraining}
        />
      )
    } else {
      return null
    }
  }

  makeSections (horseUsers, horses, ownRideList, userID, users, rides) {
    const allFeedItems = []

    for (let horseUser of horseUsers.valueSeq()) {
      const horse = horses.get(horseUser.get('horseID'))
      if (!horse) {
        throw Error("Should have a horse here.")
      }
      if (horseUser.get('deleted') !== true
        && (!ownRideList || (ownRideList && horseUser.get('userID') === userID))
        && horseUser.get('createTime') > this.props.endOfFeed
      ) {
        const rider = users.get(horseUser.get('userID'))
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

    for (let ride of rides) {
      const user = users.get(ride.get('userID'))
      if (!user) {
        throw Error(`no user found! ${ride.get('userID')}`)
      }
      if (ride.get('startTime') > this.props.endOfFeed) {
        allFeedItems.push(new FeedItem(ride, ride.get('startTime'), user, 'ride', ride.get('_id')))
      }
    }


    allFeedItems.sort((a, b) => b.sortTime - a.sortTime)
    const lastTime = allFeedItems[allFeedItems.length - 1].sortTime
    allFeedItems.push(new FeedItem(null, lastTime - 1, null, 'endItem', 'endItem'))

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
        sections={this.memoMakeSections(
          this.props.horseUsers,
          this.props.horses,
          this.props.ownRideList,
          this.props.userID,
          this.props.users,
          this.props.rides
        )}
        stickySectionHeadersEnabled={false}
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


