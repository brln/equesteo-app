import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import {
  Text,
  View
} from 'react-native'

import { brand } from '../../colors'
import { logRender } from '../../helpers'
import Button from '../../components/Button'
import EqNavigation from '../../services/EqNavigation'
import {
  deleteUnpersistedHorse,
  userUpdated,
} from '../../actions/standard'
import functional from '../../actions/functional'
import Wrapper from '../../components/FirstStart/Wrapper'


class FinalPage extends PureComponent {
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

  constructor(props) {
    super(props)
    this.done = this.done.bind(this)
  }

  done () {
    this.props.dispatch(userUpdated(this.props.user.set('finishedFirstStart', true)))
    this.props.dispatch(functional.persistUserUpdate(this.props.user.get('_id'), [], false))

    EqNavigation.popToRoot(this.props.componentId).then(() => {
      if (this.props.skippedHorse) {
        this.props.dispatch(deleteUnpersistedHorse(this.props.horseID, this.props.horseUserID))
      }
      this.props.dispatch(functional.doSync())
    }).catch(() => {})
  }

  render() {
    logRender('FinalPage')
    return (
      <Wrapper>
        <View style={{flex: 1}}>
          <View style={{flex: 1}}>
            <View style={{flex: 1}}>
              <Text style={{
                fontSize: 30,
                fontFamily: 'Montserrat-Regular',
                color: 'black',
                textAlign: 'center'
              }}>
                You're all set!
              </Text>
            </View>
            <View style={{flex: 4}}>
              <View>
                <Text style={{textAlign: 'center', fontSize: 20, padding: 20}}>If you need any help, have ideas or concerns about the app, or just want to talk horses, email me!</Text>
              </View>
              <View>
                <Text style={{textAlign: 'center', fontSize: 20}}>nicole@equesteo.com</Text>
                <View style={{paddingTop: 20, marginRight: 40, marginLeft: 40}}>
                  <Button
                    color={brand}
                    text={"Got It"}
                    onPress={this.done}
                  />
                </View>
              </View>
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
  const horseID = localState.getIn(['firstStartHorseID', 'horseID'])
  const horseUserID = localState.getIn(['firstStartHorseID', 'horseUserID'])
  return {
    horseID,
    horseUserID,
    skippedHorse: passedProps.skippedHorse,
    user: pouchState.getIn(['users', localState.get('userID')]),
  }
}

export default connect(mapStateToProps)(FinalPage)
