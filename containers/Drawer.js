import React, { Component } from 'react'
import { connect } from 'react-redux';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import {
  ACCOUNT,
  BARN,
  FEED,
  FEED_DETAILS,
  FOLLOWING,
  RIDES,
  RIDES_DETAILS,
  RECORDER
} from '../screens'
import { changeScreen } from '../actions'

class DrawerContainer extends Component {
  constructor (props) {
    super(props)
		this.openRecorder = this.openRecorder.bind(this)
    this.toggleDrawer = this.toggleDrawer.bind(this)
		this.openAccount = this.openAccount.bind(this)
    this.openBarn = this.openBarn.bind(this)
    this.openFeed = this.openFeed.bind(this)
    this.openFollowing = this.openFollowing.bind(this)
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

    return (
      <View style={styles.linearGradient}>
				<View style={styles.container}>
					<View style={styles.drawerList}>
            {feed}
            {following}
            {recorder}
						{barnScreen}
						{myAccountScreen}
					</View>
					<Text style={styles._version}>
						{/* 'v1.0.0' */}
					</Text>
				</View>
			</View>
    )
  }
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingLeft: 25,
		justifyContent: 'center'
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
		flex: 1
	},
	_version: {
		color: '#3c3c3c',
		position: 'absolute',
		bottom: 25,
		marginLeft: 53
	}
});

function mapStateToProps (state) {
  return {
  	currentScreen: state.currentScreen
	}
}

export default  connect(mapStateToProps)(DrawerContainer)
