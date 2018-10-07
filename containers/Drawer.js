import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'

import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import {
  BARN,
  PROFILE,
  RECORDER,
  TRAINING,
} from '../screens'
import { brand, lightGrey } from '../colors'
import { logRender } from '../helpers'


const { height, width } = Dimensions.get('window')

class DrawerContainer extends Component {
  constructor (props) {
    super(props)
    this.toggleDrawer = this.toggleDrawer.bind(this)
    this.openAccount = this.openAccount.bind(this)
    this.openBarn = this.openBarn.bind(this)
    this.openRecorder = this.openRecorder.bind(this)
    this.openTraining = this.openTraining.bind(this)
  }

  shouldComponentUpdate () {
    return false
  }

  openRecorder () {
    this.toggleDrawer()
    Navigation.push(this.props.activeComponent, {
      component: {
        name: RECORDER,
      }
    });
	}

  openAccount () {
    this.toggleDrawer()
    Navigation.push(this.props.activeComponent, {
      component: {
        name: PROFILE,
        title: 'My Account',
        passProps: {
          profileUser: this.props.user,
        }
      }
    });
	}

  openBarn () {
    this.toggleDrawer()
    Navigation.push(this.props.activeComponent, {
      component: {
        name: BARN,
      }
    });
  }

  openTraining () {
    this.toggleDrawer()
    Navigation.push(this.props.activeComponent, {
      component: {
        name: TRAINING,
      }
    });
  }

  toggleDrawer() {
    Navigation.mergeOptions(this.props.activeComponent, {
      sideMenu: {
        left: {
          visible: false,
        }
      }
    });
  }

  render() {
    logRender('DrawerContainer')
    return (
      <ScrollView style={styles.linearGradient}>
        <View style={{height: height - StatusBar.currentHeight}}>
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
                <TouchableOpacity onPress={this.openRecorder}>
                  <View style={styles.drawerListItem}>
                    <Text style={styles.drawerListItemText} onTouch>
                      Go Ride
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={this.openBarn}>
                  <View style={styles.drawerListItem}>
                    <Text style={styles.drawerListItemText}>
                      My Barn
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={this.openTraining}>
                  <View style={styles.drawerListItem}>
                    <Text style={styles.drawerListItemText} onTouch>
                      Training
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
            </View>
        </View>
      </ScrollView>
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
      height: height,
      width: width * 0.75
	},
});

function mapStateToProps (state) {
  const users = state.getIn(['main', 'users'])
  const userID = state.getIn(['main', 'localState', 'userID'])
  const activeComponent = state.getIn(['main', 'localState', 'activeComponent'])
  return {
    activeComponent,
    user: users.get(userID)
	}
}

export default  connect(mapStateToProps)(DrawerContainer)
