import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Navigation } from 'react-native-navigation'

import {
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { brand, darkGrey, lightGrey } from '../colors'
import { logRender } from '../helpers'
import { BARN, FEEDBACK, FIND_PEOPLE, PROFILE } from '../screens'
import Thumbnail from '../components/Images/Thumbnail'
import { EqNavigation } from '../services'

const { width } = Dimensions.get('window')

class MoreContainer extends Component {
  static options() {
    return {
      topBar: {
        title: {
          text: "More",
          color: 'white',
          fontSize: 20
        },
        background: {
          color: brand,
        },
        backButton: {
          color: 'white'
        },
        elevation: 0
      },
      layout: {
        orientation: ['portrait']
      }
    };
  }

  constructor (props) {
    super(props)
    this.showBarn = this.showBarn.bind(this)
    this.showFeedback = this.showFeedback.bind(this)
    this.showFindFriends = this.showFindFriends.bind(this)
    this.showMyAccount = this.showMyAccount.bind(this)
  }

  shouldComponentUpdate () {
    return false
  }

  showFeedback () {
    EqNavigation.push(this.props.activeComponent, {
      component: {
        name: FEEDBACK,
      }
    })
  }

  showBarn () {
    EqNavigation.push(this.props.activeComponent, {
      component: {
        name: BARN,
      }
    })
  }

  showFindFriends() {
    EqNavigation.push(this.props.activeComponent, {
      component: {
        name: FIND_PEOPLE,
        title: 'Find Friends',
      }
    })
  }

  showMyAccount () {
    EqNavigation.push(this.props.activeComponent, {
      component: {
        name: PROFILE,
        title: 'My Account',
        passProps: {
          profileUser: this.props.user,
        }
      }
    })
  }

  renderMenuItem ({ item }) {
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={{height: 80, backgroundColor: brand}}
          onPress={item.onPress}
        >
          <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: darkGrey, padding: 20}}>
            <View style={{flex: 1, justifyContent:'center'}}>
              <Thumbnail
                emptySource={item.icon}
                empty={true}
                height={width / 7}
                width={width/ 7}
              />
            </View>
            <View style={{flex: 3, justifyContent: 'center'}}>
              <Text style={{color: 'white', fontSize: 20}}>{item.name}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    logRender('MoreContainer')
    const menuItems = [
      {
        name: 'My Barn',
        screen: BARN,
        icon: require('../img/mainMenus/barn_wt.png'),
        onPress: this.showBarn
      },
      {
        name: 'Find Friends',
        screen: FIND_PEOPLE,
        icon: require('../img/mainMenus/findPeople_wt.png'),
        onPress: this.showFindFriends
      },
      {
        name: 'My Account',
        screen: PROFILE,
        icon: require('../img/mainMenus/profile_wt.png'),
        onPress: this.showMyAccount
      },
      {
        name: 'Feedback',
        screen: FEEDBACK,
        icon: require('../img/mainMenus/feedback.png'),
        onPress: this.showFeedback
      }
    ]

    return (
      <View>
        <View style={{backgroundColor: lightGrey, height: 30}} />
        <FlatList
          keyExtractor={i => i.name}
          containerStyle={{marginTop: 0}}
          data={menuItems}
          renderItem={this.renderMenuItem}
          style={{height: '100%', borderTopWidth: 1, borderTopColor: darkGrey, backgroundColor: lightGrey}}
        />
      </View>
    )
  }
}

function mapStateToProps (state) {
  const pouchState = state.get('pouchRecords')
  const localState = state.get('localState')
  const users = pouchState.get('users')
  const activeComponent = localState.get('activeComponent')
  const userID = localState.get('userID')
  return {
    activeComponent,
    user: users.get(userID)
  }
}

export default  connect(mapStateToProps)(MoreContainer)
