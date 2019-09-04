import React from 'react';

import { logInfo } from '../helpers'
import BuildImage from './Images/BuildImage'

export default function FabImage (props) {
  return (
    <BuildImage
      source={props.source}
      style={{resizeMode: 'contain', width: props.width, height: props.height}}
    />
  )
}
