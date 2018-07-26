import React, { PureComponent } from 'react'
import {
  Text,
  View
} from 'react-native'

import { formattedWeekString } from "../../helpers"

export default class SectionHeader extends PureComponent {
  render () {
    return (
      <View>
        <View style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 20}}>
          <Text style={{fontWeight: 'bold'}}>Week of {formattedWeekString(this.props.title)}</Text>
        </View>
      </View>
    )
  }

}