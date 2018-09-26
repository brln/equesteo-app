import React from 'react';
import { Image } from 'react-native'

import { logError } from '../helpers'

export default function FabImage (props) {
  return (
    <Image
      source={props.source}
      style={{width: props.width, height: props.height}}
      onError={() => logError("Can't load FabImage")}
    />
  )
}
