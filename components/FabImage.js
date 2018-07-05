import React from 'react';
import { Image} from 'react-native'

export default function FabImage (props) {
  return (
    <Image source={props.source} style={{width: props.width, height: props.height}}/>
  )
}
