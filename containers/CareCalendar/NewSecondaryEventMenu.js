import { Map } from 'immutable'
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
import {setCareEventSpecificData, setSecondaryCareEventType} from '../../actions/standard'
import Thumbnail from '../../components/Images/Thumbnail'
import { FARRIER, GROUNDWORK, VETERINARY } from "../../screens/consts/care"
import { EqNavigation } from '../../services'

const { width } = Dimensions.get('window')


class NewSecondaryEventMenu extends Component {
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

    this.openGroundworkPage = this.openGroundworkPage.bind(this)
    this.renderMenuItem = this.renderMenuItem.bind(this)
    this.setSecondaryEventType = this.setSecondaryEventType.bind(this)
    Navigation.events().bindComponent(this);
  }

  componentWillUnmount () {
    if (this.props.newCareEvent.get('secondaryEventType')) {
      this.props.dispatch(setSecondaryCareEventType(null))
    }
  }

  openGroundworkPage (secondaryType, pageType) {
    return () => {
      this.props.dispatch(setSecondaryCareEventType(secondaryType))
      this.props.dispatch(setCareEventSpecificData(Map({})))
      EqNavigation.push(this.props.componentId, {
        component: {
          name: GROUNDWORK,
          passProps: {
            secondaryType,
            popWhenDoneID: this.props.popWhenDoneID,
            pageType,
          }
        },
      }).catch(() => {})
    }
  }

  openFarrierPage (secondaryType) {
    return () => {
      this.props.dispatch(setSecondaryCareEventType(secondaryType))
      this.props.dispatch(setCareEventSpecificData(Map({})))
      EqNavigation.push(this.props.componentId, {
        component: {
          name: FARRIER,
          passProps: {
            secondaryType,
            popWhenDoneID: this.props.popWhenDoneID,
          }
        },
      }).catch(() => {})
    }
  }

  openVeterinaryPage (secondaryType) {
    return () => {
      this.props.dispatch(setSecondaryCareEventType(secondaryType))
      this.props.dispatch(setCareEventSpecificData(Map({})))
      EqNavigation.push(this.props.componentId, {
        component: {
          name: VETERINARY,
          passProps: {
            secondaryType,
            popWhenDoneID: this.props.popWhenDoneID,
          }
        },
      }).catch(() => {})
    }
  }

  setSecondaryEventType (type) {
    return () => {
      this.props.dispatch(setSecondaryCareEventType(type))
    }
  }

  renderMenuItem ({ item }) {
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={{height: 80, backgroundColor: this.props.bgColor}}
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
        name: 'Groundwork',
        children: [
          {
            name: 'Handwalk',
            icon: require('../../img/careCalendar/arena.png'),
            onPress: this.openGroundworkPage('Handwalk', 'timer'),
          },
          {
            name: 'Lunge',
            icon: require('../../img/careCalendar/arena.png'),
            onPress: this.openGroundworkPage('Lunge', 'timer'),
          },
          {
            name: 'Carrot Stretches',
            icon: require('../../img/careCalendar/arena.png'),
            onPress: this.openGroundworkPage('Carrot Stretches', 'counter'),
          },
          {
            name: 'Other',
            icon: require('../../img/careCalendar/arena.png'),
            onPress: this.openGroundworkPage('Other', 'timer'),
          },
        ]
      },
      {
        name: 'Farrier',
        children: [
          {
            name: 'Trim',
            icon: require('../../img/careCalendar/horseshoe.png'),
            onPress: this.openFarrierPage('Trim'),
          },
          {
            name: 'Shoe',
            icon: require('../../img/careCalendar/horseshoe.png'),
            onPress: this.openFarrierPage('Shoe'),
          },
          {
            name: 'Other',
            icon: require('../../img/careCalendar/horseshoe.png'),
            onPress: this.openFarrierPage('Other'),
          },
        ]
      },
      {
        name: 'Veterinary',
        children: [
          {
            name: 'Tooth Float',
            icon: require('../../img/careCalendar/medical.png'),
            onPress: this.openVeterinaryPage('Tooth Float'),
          },
          {
            name: 'Vaccination',
            icon: require('../../img/careCalendar/medical.png'),
            onPress: this.openVeterinaryPage('Vaccination'),
          },
          {
            name: 'Deworm',
            icon: require('../../img/careCalendar/medical.png'),
            onPress: this.openVeterinaryPage('Deworm'),
          },
          {
            name: 'X-Rays',
            icon: require('../../img/careCalendar/medical.png'),
            onPress: this.openVeterinaryPage('X-Rays'),
          },
          {
            name: 'Injections',
            icon: require('../../img/careCalendar/medical.png'),
            onPress: this.openVeterinaryPage('Injections'),
          },
          {
            name: 'Other',
            icon: require('../../img/careCalendar/medical.png'),
            onPress: this.openVeterinaryPage('Other'),
          },
        ]
      },
    ]

    let data = menuItems
    for (let menuItem of menuItems) {
      if (menuItem.name === this.props.newCareEvent.get('mainEventType')) {
        data = menuItem.children
        break
      }
    }

    if (data) {
      return (
        <View>
          <View style={{backgroundColor: lightGrey, height: 30}} />
          <FlatList
            keyExtractor={i => i.name}
            containerStyle={{marginTop: 0}}
            data={data}
            renderItem={this.renderMenuItem}
            style={{height: '100%', borderTopWidth: 1, borderTopColor: darkGrey, backgroundColor: lightGrey}}
          />
        </View>
      )
    } else {
      return null
    }
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

export default  connect(mapStateToProps)(NewSecondaryEventMenu)
