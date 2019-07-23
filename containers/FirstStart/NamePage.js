import React, { PureComponent } from 'react'
import {
  ScrollView,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'

import { brand } from '../../colors'
import { logRender } from '../../helpers'
import Button from '../../components/Button'
import NameForm from '../../components/FirstStart/NameForm'
import {
  userUpdated,
} from '../../actions/standard'
import {
  persistUserUpdate
} from "../../actions/functional"
import EqNavigation from "../../services/EqNavigation"
import { PROFILE_PHOTO_PAGE } from "../../screens/consts/firstStart"
import Wrapper from '../../components/FirstStart/Wrapper'


class NamePage extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: 'transparent',
        },
        elevation: 0,
        backButton: {
          color: brand,
        },
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor () {
    super()
    this.changeFirstName = this.changeFirstName.bind(this)
    this.changeLastName = this.changeLastName.bind(this)
    this.nextPage = this.nextPage.bind(this)
    this.updateUser = this.updateUser.bind(this)
    this.inputs = []
  }

  changeFirstName (value) {
    const updated = this.props.user.set('firstName', value)
    this.updateUser(updated)
  }

  changeLastName (value) {
    const updated = this.props.user.set('lastName', value)
    this.updateUser(updated)
  }

  nextPage () {
    this.props.dispatch(persistUserUpdate(this.props.user.get('_id'), [], false))
    EqNavigation.push(this.props.componentId, {
      component: {
        name: PROFILE_PHOTO_PAGE,
      }
    }).catch(() => {})
  }

  updateUser (newUser) {
    this.props.dispatch(userUpdated(newUser))
  }


  render() {
    logRender('NamePage')
    return (
      <Wrapper>
        <View style={{flex: 1}}>
          <View>
            <Text style={{
              fontSize: 30,
              fontFamily: 'Montserrat-Regular',
              color: 'black',
              textAlign: 'center'
            }}>
              What's your name?
            </Text>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <NameForm
              changeFirstName={this.changeFirstName}
              changeLastName={this.changeLastName}
              nextPage={this.nextPage}
              inputs={this.inputs}
              user={this.props.user}
            />
            <View style={{flex: 1, paddingTop: 20}}>
              <Button
                color={brand}
                text={"Go On"}
                onPress={this.nextPage}
              />
            </View>
          </View>
        </View>
      </Wrapper>
    )
  }
}

function mapStateToProps (state, passedProps) {
  const localState = state.get('localState')
  const pouchState = state.get('pouchRecords')
  return {
    user: pouchState.getIn(['users', localState.get('userID')]),
  }
}

export default connect(mapStateToProps)(NamePage)
