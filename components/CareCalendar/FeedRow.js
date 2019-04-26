import React, { PureComponent } from 'react'
import {
  Picker,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import BuildImage from '../Images/BuildImage'
import EqPicker from '../EqPicker'
import { brand, darkBrand, darkGrey, lightGrey } from '../../colors'


export default class FeedRow extends PureComponent {
  amountInput () {
    return (
      <View style={{flex: 1, marginRight: 10}}>
        <TextInput
          style={{width: '100%', height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1, borderRadius: 4}}
          value={this.props.amount.toString()}
          onChangeText={this.props.updateFeedRow(this.props.index, 'amount')}
          underlineColorAndroid={'transparent'}
          maxLength={20}
          selectTextOnFocus={true}
          keyboardType={'numeric'}
        />
      </View>
    )
  }

  unitPicker () {
    const items = [
      { label: 'lb', value: 'lb' },
      { label: 'flakes', value: 'flakes' },
      { label: 'bales', value: 'bales' },
      { label: 'cups', value: 'cups' },
      { label: 'oz', value: 'oz' },
      { label: 'scoops', value: 'scoops' },
      { label: 'tablespoons', value: 'tablespoons' },
    ]
    return (
      <View style={{flex: 2}}>
        <EqPicker
          value={this.props.unit}
          onValueChange={this.props.updateFeedRow(this.props.index, 'unit')}
          items={items}
        />
      </View>
    )
  }

  feedPicker () {
    const items = [
      { label: 'Hay', value: 'hay' },
      { label: 'Alfalfa', value: 'alfalfa' },
      { label: 'Beet Pulp', value: 'beet pulp' },
      { label: 'Rice Bran', value: 'rice bran' },
      { label: 'Grain', value: 'grain' },
    ]
    return (
      <View style={{flex: 1}}>
        <EqPicker
          items={items}
          value={this.props.feed}
          onValueChange={this.props.updateFeedRow(this.props.index, 'feed')}
        />
      </View>
    )
  }

  render() {
    return (
      <View style={{height: 130, paddingLeft: 10, paddingTop: 10, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: lightGrey}}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View style={{flex: 4}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              {this.amountInput()}
              {this.unitPicker()}
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
              {this.feedPicker()}
            </View>
          </View>
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity onPress={this.props.removeFeedRow(this.props.index)}>
              <BuildImage
                source={require('../../img/trash.png')}
                style={{
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: 'black',
    paddingRight: 30,
  },
  inputAndroid: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: brand,
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
  placeholder: {}
});
