import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import {
  BARN,
  FEED,
  FEED_DETAILS,
  FOLLOWING,
  PROFILE,
  RIDES,
  RIDES_DETAILS,
  RECORDER,
  TRAINING,
} from '../screens'
import { changeScreen } from '../actions'
import { brand, lightGrey } from '../colors'


const { width } = Dimensions.get('window')

class DrawerContainer extends PureComponent {
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
          id: 'back'
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
          id: 'back'
        }]
      }
		})
	}

	openAccount () {
    this.props.dispatch(changeScreen(PROFILE))
    this.toggleDrawer()
    this.props.navigator.push({
      screen: PROFILE,
      title: 'My Account',
      navigatorButtons: {
        leftButtons: [{
          id: 'back'
        }],
        rightButtons: [
          {
            icon: require('../img/threedot.png'),
            id: 'dropdown',
          }
        ]
      },
      passProps: {
        profileUser: this.props.user,
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
          id: 'back'
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
          id: 'back'
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
    console.log('rendering DrawerContainer')
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
    if (this.props.currentScreen !== PROFILE) {
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
          backgroundColor: lightGrey,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <Image
            source={require('../img/logo250.png')}
            style={{
              width: 120,
              height: 120,
              alignItems: 'center',
            }}
          />
          <Text style={{
            fontFamily: 'Panama-Light',
            fontSize: 30,
            color: 'black',
          }}>
            Equesteo
          </Text>
        </View>
				<View style={styles.container}>
					<View style={styles.drawerList}>
            {recorder}
            {feed}
            {barnScreen}
            {training}
            {following}
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
    width: width * 0.75
	},
});

function mapStateToProps (state) {
  const users = state.getIn(['main', 'users'])
  const userID = state.getIn(['main', 'localState', 'userID'])
  return {
  	currentScreen: state.getIn(['main', 'localState', 'currentScreen']),
    user: users.get(userID)
	}
}

export default  connect(mapStateToProps)(DrawerContainer)
