import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'

import { brand, darkGrey, lightGrey } from '../../colors'
import { logRender } from '../../helpers'
import Button from '../../components/Button'
import Amplitude, {
  SKIP_FIRST_START_FOREVER
} from "../../services/Amplitude"
import Wrapper from '../../components/FirstStart/Wrapper'
import {
  deleteUnpersistedHorse,
  userUpdated,
} from '../../actions/standard'
import {
  persistUserUpdate,
} from '../../actions/functional'
import { EqNavigation } from '../../services'
import { NAME_PAGE } from '../../screens/firstStart'

class IntroPage extends PureComponent {
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
    };
  }

  constructor (props) {
    super(props)
    this.skipForever = this.skipForever.bind(this)
    this.nextPage = this.nextPage.bind(this)
  }

  skipForever () {
    Amplitude.logEvent(SKIP_FIRST_START_FOREVER)
    this.props.dispatch(userUpdated(this.props.user.set('finishedFirstStart', true)))
    this.props.dispatch(persistUserUpdate(this.props.user.get('_id'), [], true))
    if (this.props.horseID) {
      this.props.dispatch(deleteUnpersistedHorse(this.props.horseID, this.props.horseUserID))
    }
    EqNavigation.pop(this.props.componentId).catch(() => {})
  }

  nextPage () {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: NAME_PAGE,
      }
    }).catch(() => {})
  }

  render() {
    logRender('IntroPage')
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
              Welcome To Equesteo!
            </Text>
          </View>
          <View style={styles.container}>
            <View style={{flex: 1}}>
              <Text style={{textAlign: 'center', fontSize: 20}}>Let's get you set up to ride.</Text>
            </View>
            <View style={{flex: 3}}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{padding: 5}}>
                  <Button
                    borderColor={lightGrey}
                    color={"transparent"}
                    text={"Skip Forever"}
                    otherTextStyle={{color: darkGrey}}
                    onPress={this.skipForever}
                  />
                </View>
                <View style={{padding: 5}}>
                  <Button
                    color={brand}
                    text={"Get Started"}
                    onPress={this.nextPage}
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

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 2,
    alignItems: 'center',
  },
});


function mapStateToProps (state, passedProps) {
  const localState = state.get('localState')
  const pouchState = state.get('pouchRecords')
  const horseID = localState.getIn(['firstStartHorseID', 'horseID'])
  const horseUserID = localState.getIn(['firstStartHorseID', 'horseUserID'])
  return {
    horseID,
    horseUserID,
    user: pouchState.getIn(['users', localState.get('userID')]),
  }
}

export default connect(mapStateToProps)(IntroPage)
