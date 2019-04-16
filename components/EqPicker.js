import React, { Component } from 'react'
import RNPickerSelect from 'react-native-picker-select';
import {
  Picker,
  Platform,
  StyleSheet,
  View,
} from 'react-native'

import { darkBrand } from '../colors'

export default class EqPicker extends Component {
  render () {
    if (Platform.OS === 'android') {
      const itemComps = this.props.items.map(i => <Picker.Item key={i.value} label={i.label} value={i.value} /> )
      return (
         <View style={{borderColor: darkBrand, borderWidth: 1, borderRadius: 4}}>
           <Picker
             selectedValue={this.props.value}
             items={itemComps}
             onValueChange={this.props.onValueChange}
             style={{height: 50}}
           >
             {itemComps}
           </Picker>
         </View>
      )
    } else {
      const newItems = [...this.props.items]
      const placeholder = newItems.shift()
      return (
        <View style={{borderWidth: 1, borderColor: darkBrand, borderRadius: 4}}>
          <RNPickerSelect
            value={this.props.value}
            items={newItems}
            onValueChange={this.props.onValueChange}
            style={pickerSelectStyles}
            placeholder={placeholder}
          />
        </View>
      )
    }
  }
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: 'black',
    paddingRight: 30,
  },
});
