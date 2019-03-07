import React, { PureComponent } from 'react'
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import BuildImage from '../Images/BuildImage'
import { brand, lightGrey } from '../../colors'

const { height } = Dimensions.get('window')

export default class TabBar extends PureComponent {
  constructor (props) {
    super(props)
  }

  render() {
    const iconHeight = height / 30
    return Platform.select({
      ios: (
        <View style={{paddingBottom: 5, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: brand, borderTopWidth: 1, borderTopColor: lightGrey}}>
          <TouchableOpacity style={{flex: 1, alignItems: 'center'}} onPress={this.props.openRecorder}>
            <BuildImage source={require('../../img/mainMenus/goRide_wt.png')} style={{width: iconHeight, height: iconHeight}} />
            <Text style={styles.menuText}>{this.props.currentRide ? "Continue Ride" : "Go Ride!"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 1, alignItems: 'center'}} onPress={this.props.openTraining}>
            <BuildImage source={require('../../img/mainMenus/training_wt.png')} style={{width: iconHeight, height: iconHeight}} />
            <Text style={styles.menuText}>Training</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 1, alignItems: 'center'}} onPress={this.props.openLeaderboards}>
            <BuildImage source={require('../../img/mainMenus/leaderboard_wt.png')} style={{width: iconHeight, height: iconHeight}} />
            <Text style={styles.menuText}>Leaderboards</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 1, alignItems: 'center'}} onPress={this.props.openMore}>
            <BuildImage source={require('../../img/mainMenus/more_wt.png')} style={{width: iconHeight, height: iconHeight}}/>
            <Text style={styles.menuText}>More</Text>
          </TouchableOpacity>
        </View>
      ),
      android: null
    })
  }
}

const styles = StyleSheet.create({
  menuText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 10,
  }
})
