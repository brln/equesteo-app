import React, { Component } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default class Drawer extends Component {
  constructor (props) {
    super(props)
		this.openRides = this.openRides.bind(this)
		this.openRecorder = this.openRecorder.bind(this)
    this.toggleDrawer = this.toggleDrawer.bind(this)
		this.openAccount = this.openAccount.bind(this)
    this.openBarn = this.openBarn.bind(this)
  }

  openRecorder () {
    this.toggleDrawer()
    this.props.navigator.push({
      screen: 'equesteo.Recorder',
      title: 'Go Ride'
    })
	}

	openRides () {
  	this.toggleDrawer()
		this.props.navigator.push({
      screen: 'equesteo.Rides',
			title: 'Rides'
    })
	}

	openAccount () {
    this.toggleDrawer()
    this.props.navigator.push({
      screen: 'equesteo.Account',
      title: 'My Account'
    })
	}

  openBarn () {
    this.toggleDrawer()
    this.props.navigator.push({
      screen: 'equesteo.Barn',
      title: 'Barn'
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
    return (
      <View style={styles.linearGradient}>
				<View style={styles.container}>
					<View style={styles.drawerList}>
						<TouchableOpacity onPress={this.openRecorder}>
							<View style={styles.drawerListItem}>
								<Text style={styles.drawerListItemText} onTouch>
									Go Ride
								</Text>
							</View>
						</TouchableOpacity>
						<TouchableOpacity onPress={this.openRides}>
							<View style={styles.drawerListItem}>
								<Text style={styles.drawerListItemText}>
									Rides
								</Text>
							</View>
						</TouchableOpacity>
						<TouchableOpacity onPress={this.openBarn}>
							<View style={styles.drawerListItem}>
								<Text style={styles.drawerListItemText}>
									Barn
								</Text>
							</View>
						</TouchableOpacity>
						<TouchableOpacity onPress={this.openAccount}>
							<View style={styles.drawerListItem}>
								<Text style={styles.drawerListItemText}>
									My Account
								</Text>
							</View>
						</TouchableOpacity>
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
		// top: 0,
		// left: 0,
		// right: 0,
		// height: 248,
		// position: 'absolute'
		flex: 1
	},
	_version: {
		color: '#3c3c3c',
		position: 'absolute',
		bottom: 25,
		marginLeft: 53
	}
});
