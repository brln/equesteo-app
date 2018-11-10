import React, { PureComponent } from 'react'
import {
  Image,
  Text,
  View
} from 'react-native'
import BuildImage from './BuildImage'

export default class URIIImage extends PureComponent {
  constructor () {
    super()
    this.state = {
      error: false
    }
    this.mainImage = this.mainImage.bind(this)
    this.typeImage = this.typeImage.bind(this)
    this.onError = this.onError.bind(this)
  }

  onError () {
    this.props.onError ? this.props.onError() : null
    this.setState({
      error: true
    })
  }

  typeImage () {
    try {
      const sourceType = this.props.source.uri.split(':')[0]
      let typeImage
      if (this.props.showSource) {
        if (sourceType === 'https') {
          typeImage = (
            <BuildImage
              source={require('../img/cloud.png')}
              style={{width: 20, height: 20}}
            />
          )
        } else if (sourceType === 'file') {
          typeImage = (
            <BuildImage
              source={require('../img/onDevice.png')}
              style={{width: 20, height: 20}}
            />
          )
        }
      }
      return typeImage
    } catch (e) {}
  }

  mainImage () {
    let mainImage
    if (this.state.error) {
      mainImage = (
        <View style={{height: '100%', width: '100%', padding: 5, justifyContent: 'center', alignItems: 'center'}}>
          <BuildImage
            source={require('../img/error.png')}
            style={{width: 30, height: 30}}
          />
          <Text style={{textAlign: 'center'}}>Could not load Image</Text>
        </View>

      )
    } else {
      mainImage = (
        <Image
          source={this.props.source}
          style={this.props.style}
          onError={this.onError}
        />
      )
    }
    return mainImage
  }

  render () {
    return (
      <View style={{flex: this.props.wrapFlex}}>
        { this.mainImage() }
        <View style={{position: 'absolute', bottom: 5, right: 5}}>
          { this.typeImage() }
        </View>
      </View>
    )
  }
}
