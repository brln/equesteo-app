import React, { Component } from 'react'
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import URIImage from '../URIImage'
const { width } = Dimensions.get('window')
import { darkGrey } from '../../colors'

export default class PhotoFilmstrip extends Component {
  constructor (props) {
    super(props)
    this.thumbnail = this.thumbnail.bind(this)
    this.showPhotoLightbox = this.showPhotoLightbox.bind(this)
  }

  showPhotoLightbox (selectedID) {
    const sources = this.props.photosByID.keySeq().reduce((accum, photoID) => {
      if (photoID !== selectedID) {
        accum.push({url: this.props.photosByID.getIn([photoID, 'uri'])})
      }
      return accum
    }, [])
    sources.unshift({url: this.props.photosByID.getIn([selectedID, 'uri'])})
    return () => {
      this.props.showPhotoLightbox(sources)
    }
  }

  thumbnail (photoID, source) {
    return (
      <TouchableOpacity
        key={photoID}
        style={styles.photoThumbnail}
        onPress={this.showPhotoLightbox(photoID)}
      >
        <View style={{borderColor: darkGrey, borderWidth: 2, width: width / 3.5, height: width / 3.5}}>
          <URIImage
            source={source}
            style={{width: '100%', height: '100%'}}
          />
        </View>
      </TouchableOpacity>
    )
  }

  render () {
    const byTimestamp = {}
    let renderAnything = false
    for (let photoID of this.props.photosByID.keySeq()) {
      if (this.props.exclude.indexOf(photoID) < 0) {
        const photoData = this.props.photosByID.get(photoID)
        const source = {uri: photoData.get('uri')}
        byTimestamp[photoData.get('timestamp')] = this.thumbnail(photoID, source)
        renderAnything = true
      }
    }
    const sortedKeys = Object.keys(byTimestamp).sort((a, b) => b - a)
    const sortedVals = []
    for (let key of sortedKeys) {
      sortedVals.push(byTimestamp[key])
    }
    let toRender = null
    if (renderAnything) {
      toRender = (
        <ScrollView horizontal={true} style={styles.photoContainer}>
          {sortedVals}
        </ScrollView>
      )
    }
    return toRender
  }
}

const styles = StyleSheet.create({
  photoContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoThumbnail: {
    padding: 5
  },
})
