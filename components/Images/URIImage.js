import React, { PureComponent } from 'react'
import {
  Image,
  Text,
  View
} from 'react-native'
import BuildImage from './BuildImage'

export default class URIImage extends PureComponent {
  constructor () {
    super()
    this.state = {
      error: false,
      nextRetry: 4000
    }
    this.mainImage = this.mainImage.bind(this)
    this.typeImage = this.typeImage.bind(this)
    this.onError = this.onError.bind(this)
  }

  componentWillUnmount () {
    clearTimeout(this.retryTimeout)
  }

  onError () {
    this.props.onError ? this.props.onError() : null
    this.setState({
      error: true,
    })
    if (this.state.nextRetry <= 32000) {
      this.retryTimeout = setTimeout(() => {
        this.setState({
          error: false,
          nextRetry: this.state.nextRetry * 2
        })
      }, this.state.nextRetry)
    }
  }

  typeImage () {
    try {
      const sourceType = this.props.source.uri.split(':')[0]
      let typeImage
      if (this.props.showSource) {
        if (sourceType === 'https') {
          typeImage = (
            <BuildImage
              source={require('../../img/cloud.png')}
              style={{width: 20, height: 20}}
            />
          )
        } else if (sourceType === 'file' || sourceType === 'content') {
          typeImage = (
            <BuildImage
              source={require('../../img/onDevice.png')}
              style={{width: 20, height: 20}}
            />
          )
        }
      }
      return typeImage
    } catch (e) {
      return null
    }
  }

  mainImage () {
    let mainImage
    if (this.state.error) {
      mainImage = (
        <View style={{height: '100%', width: '100%', padding: 5, justifyContent: 'center', alignItems: 'center'}}>
          <BuildImage
            source={require('../../img/error.png')}
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
          resizeMode={this.props.resizeMode}
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
        {this.props.children}
      </View>
    )
  }
}
