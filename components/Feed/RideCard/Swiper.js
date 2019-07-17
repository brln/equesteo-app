import React, { PureComponent } from 'react'
import {
  Dimensions,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'

import { logInfo } from '../../../helpers'
import RideMapImage from '../RideMapImage'
import MedImage from '../../Images/MedImage'

const { width } = Dimensions.get('window')
const swiperHeight = width * (2/3)

export default class Swiper extends PureComponent {
  constructor (props) {
    super(props)
  }

  render () {
    const mapImage = (
      <TouchableOpacity onPress={this.props.showRide(false)} style={{flex: 1}} key="map">
        <RideMapImage
          uri={this.props.ride.get('mapURL')}
          style={{height: swiperHeight, width: width, flex: 1}}
        />
      </TouchableOpacity>
    )
    if (this.props.ridePhotos.keySeq().count() > 0) {
      const images = []
      let coverImage = null
      this.props.ridePhotos.reduce((accum, photo) => {
        const thisImage = (
          <MedImage
            style={{height: swiperHeight, width: width - 5}}
            key={photo.get('uri')}
            source={{uri: photo.get('uri')}}
            onError={() => { logInfo('there was an error loading RideCard image') }}
            showSource={true}
            onPress={this.props.showRide(false)}
          />
        )
        if (photo.get('_id') !== this.props.ride.get('coverPhotoID')) {
          accum.push(thisImage)
        } else {
          coverImage = thisImage
        }
        return accum
      }, images)
      images.push(mapImage)
      if (coverImage) images.unshift(coverImage)
      return (
        <ScrollView
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          pagingEnabled={true}
          style={{height: swiperHeight}}
        >
          <View style={{flex: 1, flexDirection: 'row'}}>
            {images}
          </View>
        </ScrollView>
      )
    } else {
      return mapImage
    }
  }
}

const styles = StyleSheet.create({
  rideTitle: {
    fontSize: 24
  },
  cardHeaderTouch: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
