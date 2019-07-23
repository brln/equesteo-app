import { Navigation } from 'react-native-navigation'
import React, { Component } from 'react'
import {
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { connect } from 'react-redux'

import { brand, darkGrey, lightGrey } from '../../colors'
import { feed, groundwork, veterinary, ferrier} from '../../colors'
import { setMainCareEventType } from '../../actions/standard'
import Thumbnail from '../../components/Images/Thumbnail'
import { FEED_PAGE, NEW_SECONDARY_EVENT_MENU } from "../../screens/consts/care"
import { EqNavigation } from '../../services'

const { width } = Dimensions.get('window')


class NewMainEventMenu extends Component {
  static options() {
    return {
      topBar: {
        title: {
          text: "Pick Type",
          color: 'white',
          fontSize: 20
        },
        background: {
          color: brand,
        },
        elevation: 0,
        backButton: {
          color: 'white'
        },
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor(props) {
    super(props)

    this.setMainEventType = this.setMainEventType.bind(this)
    this.openFeedPage = this.openFeedPage.bind(this)

    Navigation.events().bindComponent(this);
  }

  componentWillUnmount () {
    if (this.props.newCareEvent.get('mainEventType')) {
      this.props.dispatch(setMainCareEventType(null))
    }
  }

  openFeedPage () {
    this.props.dispatch(setMainCareEventType('Feed'))
    EqNavigation.push(this.props.componentId, {
      component: {
        name: FEED_PAGE,
        passProps: {
          popWhenDoneID: this.props.popWhenDoneID,
          bgColor: feed
        }
      },
    }).catch(() => {})
  }

  setMainEventType (type, bgColor) {
    return () => {
      this.props.dispatch(setMainCareEventType(type))
      EqNavigation.push(this.props.componentId, {
        component: {
          name: NEW_SECONDARY_EVENT_MENU,
          passProps: {
            popWhenDoneID: this.props.popWhenDoneID,
            bgColor,
          }
        },
      }).catch(() => {})
    }
  }

  renderMenuItem ({ item }) {
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={{height: 80, backgroundColor: item.bgColor}}
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
    const menuItems = [
      {
        name: 'Feed',
        icon: require('../../img/careCalendar/hay.png'),
        onPress: this.openFeedPage,
        bgColor: feed,
      },
      {
        name: 'Groundwork',
        icon: require('../../img/careCalendar/arena.png'),
        onPress: this.setMainEventType('Groundwork', groundwork),
        bgColor: groundwork
      },
      {
        name: 'Farrier',
        icon: require('../../img/careCalendar/horseshoe.png'),
        onPress: this.setMainEventType('Farrier', ferrier),
        bgColor: ferrier,
      },
      {
        name: 'Veterinary',
        icon: require('../../img/careCalendar/medical.png'),
        onPress: this.setMainEventType('Veterinary', veterinary),
        bgColor: veterinary,
      },
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

function mapStateToProps (state, passedProps) {
  const localState = state.get('localState')
  const activeComponent = localState.get('activeComponent')
  return {
    activeComponent,
    popWhenDoneID: passedProps.popWhenDoneID,
    newCareEvent: localState.get('newCareEvent'),
  }
}

export default  connect(mapStateToProps)(NewMainEventMenu)
