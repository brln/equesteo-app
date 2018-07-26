import React from 'react'
import {
  Text,
  View
} from 'react-native'

import { formattedWeekString } from "../../helpers"

export default function SectionHeader (props) {
  return (
    <View>
      <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 20}}>
        <Text style={{fontWeight: 'bold'}}>Week of {formattedWeekString(props.title)}</Text>
      </View>
    </View>
  )
}