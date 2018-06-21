import React, { Component } from 'react'
import { connect } from 'react-redux';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import {
  ACCOUNT,
  BARN,
  FEED,
  FEED_DETAILS,
  FOLLOWING,
  RIDES,
  RIDES_DETAILS,
  RECORDER,
  TRAINING,
} from '../screens'
import { changeScreen } from '../actions'
import { brand } from '../colors'

class DrawerContainer extends Component {
  constructor (props) {
    super(props)
    this.toggleDrawer = this.toggleDrawer.bind(this)
		this.openAccount = this.openAccount.bind(this)
    this.openBarn = this.openBarn.bind(this)
    this.openFeed = this.openFeed.bind(this)
    this.openFollowing = this.openFollowing.bind(this)
		this.openRecorder = this.openRecorder.bind(this)
    this.openTraining = this.openTraining.bind(this)
  }

  openFeed () {
    this.props.dispatch(changeScreen(FEED))
    this.toggleDrawer()
    this.props.navigator.push(FEED_DETAILS)
  }

  openFollowing () {
    this.props.dispatch(changeScreen(FOLLOWING))
    this.toggleDrawer()
    this.props.navigator.push({
      screen: FOLLOWING,
      title: 'Following',
      navigatorButtons: {
        leftButtons: [{
          id: 'sideMenu'
        }]
      }
    })
  }

  openRecorder () {
    this.props.dispatch(changeScreen(RECORDER))
    this.toggleDrawer()
    this.props.navigator.push({
      screen: RECORDER,
      title: 'Go Ride',
      navigatorButtons: {
        leftButtons: [{
          id: 'sideMenu'
        }]
      }
		})
	}

	openAccount () {
    this.props.dispatch(changeScreen(ACCOUNT))
    this.toggleDrawer()
    this.props.navigator.push({
      screen: ACCOUNT,
      title: 'My Account',
      navigatorButtons: {
        leftButtons: [{
          id: 'sideMenu'
        }]
      }
    })
	}

  openBarn () {
    this.props.dispatch(changeScreen(BARN))
    this.toggleDrawer()
    this.props.navigator.push({
      screen: BARN,
      title: 'Barn',
      navigatorButtons: {
        leftButtons: [{
          id: 'sideMenu'
        }]
      }
    })
  }

  openTraining () {
    this.props.dispatch(changeScreen(TRAINING))
    this.toggleDrawer()
    this.props.navigator.push({
      screen: TRAINING,
      title: 'Training',
      navigatorButtons: {
        leftButtons: [{
          id: 'sideMenu'
        }]
      }
    })
  }

	toggleDrawer() {
		this.props.navigator.toggleDrawer({
			to: 'closed',
			side: 'left',
			animated: true
		});
  }

  render() {
    let feed = null
    let barnScreen = null
		let myAccountScreen = null
    let recorder = null
    let following = null
    let training = null
    if (this.props.currentScreen !== FEED) {
      feed = (
        <TouchableOpacity onPress={this.openFeed}>
          <View style={styles.drawerListItem}>
            <Text style={styles.drawerListItemText}>
              Feed
            </Text>
          </View>
        </TouchableOpacity>
      )
    }
    if (this.props.currentScreen !== BARN) {
      barnScreen = (
        <TouchableOpacity onPress={this.openBarn}>
          <View style={styles.drawerListItem}>
            <Text style={styles.drawerListItemText}>
              Barn
            </Text>
          </View>
        </TouchableOpacity>
			)
    }
    if (this.props.currentScreen !== ACCOUNT) {
			myAccountScreen = (
        <TouchableOpacity onPress={this.openAccount}>
          <View style={styles.drawerListItem}>
            <Text style={styles.drawerListItemText}>
              My Account
            </Text>
          </View>
        </TouchableOpacity>
			)
		}
		if (this.props.currentScreen !== RECORDER) {
      recorder = (
				<TouchableOpacity onPress={this.openRecorder}>
					<View style={styles.drawerListItem}>
						<Text style={styles.drawerListItemText} onTouch>
							Go Ride
						</Text>
					</View>
				</TouchableOpacity>
      )
    }
    if (this.props.currentScreen !== FOLLOWING) {
      following = (
        <TouchableOpacity onPress={this.openFollowing}>
          <View style={styles.drawerListItem}>
            <Text style={styles.drawerListItemText} onTouch>
              Following
            </Text>
          </View>
        </TouchableOpacity>
      )
    }
    if (this.props.currentScreen !== TRAINING) {
      training = (
        <TouchableOpacity onPress={this.openTraining}>
          <View style={styles.drawerListItem}>
            <Text style={styles.drawerListItemText} onTouch>
              Training
            </Text>
          </View>
        </TouchableOpacity>
      )
    }

    return (
      <View style={styles.linearGradient}>
        <View style={{
          flex: 1,
          backgroundColor: '#e8eae8',
          alignItems: 'center',
          flexDirection: 'row',
          paddingLeft: 25
        }}>
          <Image
            source={require('../img/logo.png')}
            style={{
              width: 80,
              height: 80,
              alignItems: 'center',
              paddingRight: 15,
            }}
          />
          <Text style={{
            fontFamily: 'RockSalt',
            fontSize: 30,
            color: 'black',
          }}>
            Equesteo
          </Text>
        </View>
				<View style={styles.container}>
					<View style={styles.drawerList}>
            {feed}
            {following}
            {training}
            {recorder}
						{barnScreen}
						{myAccountScreen}
					</View>
				</View>
			</View>
    )
  }
}

const styles = StyleSheet.create({
	container: {
		flex: 2,
    paddingTop: 30,
		paddingLeft: 20,
		justifyContent: 'flex-start',
    backgroundColor: brand,
	},
	drawerList: {

	},
	drawerListIcon: {
		width: 27
	},
	drawerListItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 23
	},
	drawerListItemText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 23,
		paddingLeft: 15,
		flex: 1
	},
	linearGradient: {
		flex: 1,
	},
});

function mapStateToProps (state) {
  return {
  	currentScreen: state.localState.currentScreen
	}
}

export default  connect(mapStateToProps)(DrawerContainer)
