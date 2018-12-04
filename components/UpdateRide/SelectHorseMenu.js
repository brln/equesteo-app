import React, { PureComponent } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import BuildImage from '../BuildImage'

const { width } = Dimensions.get('window')

function MenuItem (props) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={props.onPress}>
      <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
        <View style={{flex: 1}}>
          <BuildImage
            source={props.icon}
            style={{flex: 1, height: null, width: null, resizeMode: 'contain'}}
          />
        </View>
        <View style={{flex: 3}}>
          <Text style={{fontSize: 20}}>{props.text}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default class SelectHorseMenu extends PureComponent {
  constructor (props) {
    super(props)
  }

  selectHorse (selectionType) {
    return () => {
      this.props.selectHorse(selectionType, this.props.horseID)
    }
  }

  render() {
    if (this.props.visible) {
      return (
        <TouchableWithoutFeedback style={{width: '100%', height: '100%'}}>
          <View style={styles.modalBackground}>
            <View style={{position: 'absolute', bottom: 0, height: 300, width, backgroundColor: 'white', elevation: 20}}>
              <View style={{flex: 1, alignItems: 'stretch'}}>
                <MenuItem
                  onPress={this.selectHorse('rider')}
                  text="I Rode"
                  icon={require('../../img/iRode.png')}
                />
                <MenuItem
                  onPress={this.selectHorse('otherRider')}
                  text="Someone Else Rode"
                  icon={require('../../img/someoneElseRode.png')}
                />
                <MenuItem
                  onPress={this.selectHorse('ponied')}
                  text="Ponied"
                  icon={require('../../img/ponied.png')}
                />
                <MenuItem
                  onPress={this.selectHorse('packed')}
                  text="Packed"
                  icon={require('../../img/pack.png')}
                />
                <MenuItem
                  onPress={this.selectHorse('drove')}
                  text="Drove"
                  icon={require('../../img/drove.png')}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )
    } else {
      return null
    }
  }
}

const styles = StyleSheet.create({
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(52, 52, 52, 0.8)'
  },
  menuItem: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
  }
});
