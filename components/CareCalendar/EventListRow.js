import moment from 'moment'
import React, { PureComponent } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import HorseThumbnails from '../Shared/HorseThumbnails'
import BuildImage from '../Images/BuildImage'
import { darkGrey, veryDarkGrey }  from '../../colors'
import { eventDetails } from "../../modelHelpers/careEvent"

export default class EventListRow extends PureComponent {
  constructor (props) {
    super(props)
  }

  render () {
    const details = eventDetails(this.props.careEvent)
    return (
      <TouchableOpacity
        onPress={this.props.openCareEvent(this.props.careEvent._id)}
      >
        <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: darkGrey}}>
          <View style={{flex: 6}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 5, paddingRight: 5}}>
              <View style={{width: 50, height: 50, paddingLeft: 5, marginRight: 10}}>
                <BuildImage
                  source={details.icon}
                  style={{flex: 1, resizeMode: "contain", width: null, height: null}}
                />
              </View>

              <View style={{flex: 4}}>
                <Text
                  style={{fontWeight: 'bold', color: veryDarkGrey, fontSize: 16}}
                  numberOfLines={1}
                >
                  { details.title }
                </Text>
                <Text>{moment(this.props.careEvent.date).fromNow()}</Text>
              </View>

              <View style={{flex: 3, paddingRight: 5, paddingBottom: 5}}>
                <HorseThumbnails
                  horses={this.props.horses}
                  horsePhotos={this.props.horsePhotos}
                  showHorseProfile={this.props.showHorseProfile}
                />
              </View>
            </View>

            <View style={{flex: 2, flexDirection: 'row', paddingLeft: 10, paddingRight: 10, paddingBottom: 10}}>
              <View style={{flex: 5}}>
                <Text numberOfLines={3}>{ details.content }</Text>
              </View>

            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

}
