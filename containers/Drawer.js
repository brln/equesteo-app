import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation'

import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import {
  BARN,
  FEED,
  FEEDBACK,
  FIND_PEOPLE,
  LEADERBOARDS,
  MORE,
  PROFILE,
  TRAINING,
} from '../screens'
import BuildImage from '../components/Images/BuildImage'
import { brand, lightGrey } from '../colors'
import { logRender } from '../helpers'
import { EqNavigation } from '../services'


const { height, width } = Dimensions.get('window')

class DrawerContainer extends Component {
  constructor (props) {
    super(props)
    this.openAccount = this.openAccount.bind(this)
    this.openBarn = this.openBarn.bind(this)
    this.openFeedback = this.openFeedback.bind(this)
    this.openFindFriends = this.openFindFriends.bind(this)
    this.openLeaderboards = this.openLeaderboards.bind(this)
    this.openMore = this.openMore.bind(this)
    this.openTraining = this.openTraining.bind(this)
  }

  shouldComponentUpdate () {
    return false
  }

  openMore () {
    this.toggleDrawer()
    if (this.props.activeComponent === FEED) {
      EqNavigation.push(this.props.activeComponent, {
        component: {
          name: MORE,
          title: 'More',
        },
        options: {
          sideMenu: {
            left: {
              visible: false
            }
          }
        }
      })
    }
  }

  openAccount () {
    this.toggleDrawer()
    if (this.props.activeComponent === FEED) {
      EqNavigation.push(this.props.activeComponent, {
        component: {
          name: PROFILE,
          title: 'My Account',
          passProps: {
            profileUser: this.props.user,
          },
          options: {
            sideMenu: {
              left: {
                visible: false
              }
            }
          }
        }
      })
    }
	}

	openFindFriends () {
    this.toggleDrawer()
    if (this.props.activeComponent === FEED) {
      EqNavigation.push(this.props.activeComponent, {
        component: {
          name: FIND_PEOPLE,
          title: 'Find Friends',
          options: {
            sideMenu: {
              left: {
                visible: false
              }
            }
          }
        }
      })
    }
	}

  openBarn () {
    this.toggleDrawer()
    if (this.props.activeComponent === FEED) {
      EqNavigation.push(this.props.activeComponent, {
        component: {
          name: BARN,
          options: {
            sideMenu: {
              left: {
                visible: false
              }
            }
          }
        }
      })
    }
  }

  openTraining () {
    this.toggleDrawer()
    if (this.props.activeComponent === FEED) {
      EqNavigation.push(this.props.activeComponent, {
        component: {
          name: TRAINING,
          options: {
            sideMenu: {
              left: {
                visible: false
              }
            }
          }
        }
      })
    }
  }

  openLeaderboards () {
    this.toggleDrawer()
    if (this.props.activeComponent === FEED) {
      EqNavigation.push(this.props.activeComponent, {
        component: {
          name: LEADERBOARDS,
          options: {
            sideMenu: {
              left: {
                visible: false
              }
            }
          }
        },

      })
    }
  }

  openFeedback () {
    this.toggleDrawer()
    if (this.props.activeComponent === FEED) {
      EqNavigation.push(this.props.activeComponent, {
        component: {
          name: FEEDBACK,
          options: {
            sideMenu: {
              left: {
                visible: false
              }
            }
          }
        }
      })
    }
  }

  toggleDrawer() {
    setTimeout(() => {
      return Navigation.mergeOptions(FEED, {
        sideMenu: {
          left: {
            visible: false,
          }
        }
      })
    }, 500)
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
            <BuildImage
              source={require('../img/logo250.png')}
              style={{
                width: 110,
                height: 110,
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
              <TouchableOpacity onPress={this.openTraining}>
                <View style={styles.drawerListItem}>
                  <BuildImage
                    source={require('../img/mainMenus/training_wt.png')}
                    style={styles.icon}
                  />
                  <Text style={styles.drawerListItemText} onTouch>
                    Training
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={this.openLeaderboards}>
                <View style={styles.drawerListItem}>
                  <BuildImage
                    source={require('../img/mainMenus/leaderboard_wt.png')}
                    style={styles.icon}
                  />
                  <Text style={styles.drawerListItemText} onTouch>
                    Leaderboards
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={this.openBarn}>
                <View style={styles.drawerListItem}>
                  <BuildImage
                    source={require('../img/mainMenus/barn_wt.png')}
                    style={styles.icon}
                  />
                  <Text style={styles.drawerListItemText}>
                    My Barn
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={this.openFindFriends}>
                <View style={styles.drawerListItem}>
                  <BuildImage
                    source={require('../img/mainMenus/findPeople_wt.png')}
                    style={styles.icon}
                  />
                  <Text style={styles.drawerListItemText} onTouch>
                    Find Friends
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={this.openMore}>
                <View style={styles.drawerListItem}>
                  <BuildImage
                    source={require('../img/mainMenus/more_wt.png')}
                    style={styles.icon}
                  />
                  <Text style={styles.drawerListItemText}>
                    More
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{position: 'absolute', bottom: 10, flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%'}}>
            <TouchableOpacity style={{borderColor: 'white', borderWidth: 2, borderRadius: 4}} onPress={this.openFeedback}>
              <View style={{padding: 6}}>
                <Text style={{color: 'white', fontSize: 15, textAlign: 'center'}}>
                  Feedback
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
	container: {
    flex: 2,
    paddingTop: 10,
    paddingLeft: 20,
    justifyContent: 'flex-start',
    backgroundColor: brand,
	},
	drawerList: {},
	drawerListIcon: {
		width: 27
	},
	drawerListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
	},
	drawerListItemText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 21,
		paddingLeft: 15,
		flex: 1,
	},
	linearGradient: {
    flex: 1,
    height: height,
    width: width * 0.75
	},
  icon: {
    width: width / 10,
    height: width / 10,
    alignItems: 'center',
  }
});

function mapStateToProps (state) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  const users = pouchState.get('users')
  const userID = localState.get('userID')
  const activeComponent = localState.get('activeComponent')
  return {
    activeComponent,
    user: users.get(userID)
	}
}

export default  connect(mapStateToProps)(DrawerContainer)
