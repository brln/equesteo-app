import React, { Component } from 'react';
import {
  Text,
  View
} from 'react-native';

import BuildImage from './Images/BuildImage'

export default function Stat (props) {
  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
        <View style={{flex: 1, paddingRight: 10}}>
          <BuildImage
            source={props.imgSrc}
            style={[{flex: 1, height: null, width: null, resizeMode: 'contain'}, props.imgStyle]}
          />
        </View>
        <View style={{flex: 3}}>
          <View style={{paddingBottom: 3}}>
            <Text>{props.text}</Text>
          </View>
          <Text style={{fontSize: 20, fontWeight: 'bold'}}>{props.value}</Text>
        </View>
      </View>
    </View>
  )
}
