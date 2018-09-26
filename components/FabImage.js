import React from 'react';
import { Image} from 'react-native'

import { logInfo } from '../helpers'

export default function FabImage (props) {
  return (
    <Image
      source={props.source}
      style={{width: props.width, height: props.height}}
      onError={() => logInfo("Can't load FabImage")}
    />
  )
}
