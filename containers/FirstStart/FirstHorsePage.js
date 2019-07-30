import React, { PureComponent } from 'react'
import {
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { connect } from 'react-redux'

import { brand } from '../../colors'
import { logRender } from '../../helpers'
import Button from '../../components/Button'
import HorseForm from '../../components/FirstStart/HorseForm'
import {
  createHorse,
  deleteUnpersistedHorse,
  horseUpdated,
  setFirstStartHorseID,
} from '../../actions/standard'
import functional from '../../actions/functional'
import { EqNavigation } from '../../services'
import { FINAL_PAGE, FIRST_HORSE_PHOTO } from "../../screens/consts/firstStart"
import { Navigation } from 'react-native-navigation'
import Wrapper from '../../components/FirstStart/Wrapper'

class FirstHorsePage extends PureComponent {
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

  constructor (props) {
    super(props)
    this.changeHorseName = this.changeHorseName.bind(this)
    this.changeHorseBreed = this.changeHorseBreed.bind(this)
    this.next = this.next.bind(this)
    this.skipHorse = this.skipHorse.bind(this)
    this.inputs = []
    this.state = {
      horseUpdated: props.horse
    }


    Navigation.events().bindComponent(this);
  }

  componentDidAppear () {
    if (!this.props.horse) {
      const horseID = `${this.props.userID.toString()}_${(new Date).getTime().toString()}`
      const horseUserID = `${this.props.userID}_${horseID}`
      this.props.dispatch(createHorse(horseID, horseUserID, this.props.userID))
      this.props.dispatch(setFirstStartHorseID(horseID, horseUserID))
    }
  }

  componentDidDisappear () {
    if (!this.state.horseUpdated) {
      this.props.dispatch(deleteUnpersistedHorse(this.props.horse.get('_id'), this.props.horseUser.get('_id')))
      this.props.dispatch(setFirstStartHorseID(null, null))
    }
  }

  skipHorse () {
    EqNavigation.push(this.props.componentId, {
      component: {
        name: FINAL_PAGE,
        passProps: {
          horseID: this.props.horseID,
          horseUserID: this.props.horseUserID,
          skippedHorse: true
        }
      }
    }).catch(() => {})
  }

  next () {
    if (this.state.horseUpdated) {
      this.props.dispatch(functional.persistHorseUpdate(
        this.props.horse.get('_id'),
        this.props.horseUser.get('_id'),
        [],
        [],
        this.props.horseUser.get('rideDefault'),
        false
      ))
      EqNavigation.push(this.props.componentId, {
        component: {
          name: FIRST_HORSE_PHOTO,
        }
      }).catch(() => {})
    } else {
      this.skipHorse()
    }
  }

  changeHorseName (horseName) {
    this.props.dispatch(horseUpdated(this.props.horse.set('name', horseName)))
    this.setState({
      horseUpdated: true
    })
  }

  changeHorseBreed (horseBreed) {
    this.props.dispatch(horseUpdated(this.props.horse.set('breed', horseBreed)))
    this.setState({
      horseUpdated: true
    })
  }

  render() {
    logRender('FirstHorsePage')
    return this.props.horse ? (
      <Wrapper>
        <View style={{flex: 1}}>
          <View>
            <Text style={{
              fontSize: 30,
              fontFamily: 'Montserrat-Regular',
              color: 'black',
              textAlign: 'center'
            }}>
              Add your first horse!
            </Text>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <HorseForm
              changeHorseBreed={this.changeHorseBreed}
              changeHorseName={this.changeHorseName}
              horse={this.props.horse}
              inputs={this.inputs}
              next={this.next}
            />

            <View style={{paddingTop: 20}}>
              <Button
                color={brand}
                text={"Go On"}
                onPress={this.next}
              />
            </View>

            <TouchableOpacity onPress={this.skipHorse} style={{paddingTop: 10}}>
              <Text style={{textAlign: 'center', textDecorationLine: 'underline', fontSize: 10, color: 'black'}}>Not now.</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Wrapper>
    ) : null
  }
}

function mapStateToProps (state, passedProps) {
  const localState = state.get('localState')
  const pouchState = state.get('pouchRecords')
  const horseID = localState.getIn(['firstStartHorseID', 'horseID'])
  const horseUserID = localState.getIn(['firstStartHorseID', 'horseUserID'])
  return {
    horse: pouchState.getIn(['horses', horseID]),
    horseUser: pouchState.getIn(['horseUsers', horseUserID]),
    userID: localState.get('userID'),
  }
}

export default connect(mapStateToProps)(FirstHorsePage)
