import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import BuildImage from './BuildImage'
import URIImage from './URIImage'

export default class Thumbnail extends PureComponent {
  constructor (props) {
    super(props)
    this.container = this.container.bind(this)
    this.image = this.image.bind(this)
    this.source = this.source.bind(this)
    this.textOverlay = this.textOverlay.bind(this)
  }

  source () {
    let newSource = this.props.source.uri
    if (newSource.startsWith('https://')) {
      const splitup = newSource.split('/')
      const filename = splitup[splitup.length - 1]
      const filenameSplitup = filename.split('.')
      splitup[splitup.length - 1] = `${filenameSplitup[0]}_sm.${filenameSplitup[1]}`
      newSource = splitup.join('/')
    }
    return newSource
  }

  image () {
    let image
    if (this.props.empty) {
      image = (
        <BuildImage
          style={{width: '100%', height: '100%', borderRadius: this.props.round ? this.props.height / 2 : 0 }}
          source={this.props.emptySource}
        />
      )
    } else {
      image = (
        <URIImage
          source={{uri: this.source()}}
          style={{width: '100%', height: '100%', borderRadius: this.props.round ? this.props.height / 2 : 0}}
        />
      )
    }
    return image
  }

  textOverlay () {
    let overlay
    if (this.props.textOverlay) {
      overlay = (
        <View style={styles.overlayContainer}>
          <Text style={styles.overlayText}>{ this.props.textOverlay }</Text>
        </View>
      )
    }
    return overlay
  }

  container () {
    let container
    if (this.props.onPress) {
      container = (p) => <TouchableOpacity onPress={this.props.onPress} style={{padding: this.props.padding}}>{p.children}</TouchableOpacity>
    } else {
      container = (p) => <View style={{padding: this.props.padding}}>{p.children}</View>
    }
    return container
  }

  render () {
    const Container = this.container()
    return (
      <Container>
        <View
          style={{
            borderColor: this.props.borderColor || 'transparent',
            borderWidth: 2,
            width: this.props.width,
            height: this.props.height,
            borderRadius: this.props.round ? this.props.height / 2 : 0
          }}
        >
          { this.image() }
        </View>
        { this.textOverlay() }
      </Container>
    )
  }
}

Thumbnail.propTypes = {
  source: PropTypes.shape({
    uri: PropTypes.string
  }),
  empty: PropTypes.bool,
  emptySource: PropTypes.number,
  onPress: PropTypes.func,
  borderColor: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  textOverlay: PropTypes.string,
  padding: PropTypes.number,
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: 5,
    right: 5,
    top: 5,
    bottom: 5,
    padding: 5
  },
  overlayText: {
    textAlign: 'center',
    color: 'white',
    textShadowColor: 'black',
    textShadowRadius: 5,
    textShadowOffset: {
      width: -1,
      height: 1
    }
  }
});
