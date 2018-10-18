import React from 'react';

import { logError } from '../helpers'
import BuildImage from './BuildImage'

export default function FabImage (props) {
  return (
    <BuildImage
      source={props.source}
      style={{width: props.width, height: props.height}}
      onError={() => logError("Can't load FabImage")}
    />
  )
}
