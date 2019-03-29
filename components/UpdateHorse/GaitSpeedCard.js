import { Map, List } from 'immutable'
import React, { PureComponent } from 'react'
import MultiSlider from '@ptomasroos/react-native-multi-slider'

import {
  Dimensions,
  Text,
  StyleSheet,
  View,
} from 'react-native'
import {
  Card,
  CardItem,
} from 'native-base'

const { width } = Dimensions.get('window')
import { brand, darkBrand, darkGrey } from '../../colors'
import { GaitMarker, GaitMarkerLeft, GaitMarkerRight } from './GaitMarker'

const MIN_SPEED = 0
const MAX_SPEED = 30

export default class GaitSpeedCard extends PureComponent {
  constructor (props) {
    super(props)
    this.refs = {
      walk: null,
      trot: null,
      canter: null,
      gallop: null
    }

    this.sliderChange = this.sliderChange.bind(this)
    this.updateCanter = this.updateCanter.bind(this)
    this.updateGallop = this.updateGallop.bind(this)
    this.updateWalk = this.updateWalk.bind(this)
    this.updateTrot = this.updateTrot.bind(this)
  }

  updateWalk (newState, newEnd) {
    newState = newState.set('walk', List([MIN_SPEED, newEnd]))
    newState = this.updateTrot(newState, newEnd)
    if (newEnd > this.props.gaitSpeeds.getIn(['canter', 0])) {
      newState = this.updateCanter(newState, newEnd)
    }
    if (newEnd > this.props.gaitSpeeds.getIn(['gallop', 0])) {
      newState = this.updateGallop(newState, newEnd)
    }
    return newState
  }

  updateGallop (newState, newStart) {
    return newState.set('gallop', List([newStart, MAX_SPEED]))
  }

  updateTrot (newState, newStart, newEnd=this.props.gaitSpeeds.getIn(['trot', 1])) {
    newState = newState.set('trot', List([newStart, newEnd]))
    if (newEnd > newStart) {
      newState = newState.set('trot', List([newStart, newEnd]))
    } else {
      newState = newState.set('trot', List([newStart, newStart]))
    }
    newState = this.updateCanter(newState, newEnd)
    if (newEnd > this.props.gaitSpeeds.getIn(['gallop', 0])) {
      newState = this.updateGallop(newState, newEnd)
    }
    return newState
  }

  updateCanter (newState, newStart, newEnd=this.props.gaitSpeeds.getIn(['canter', 1])) {
    newState = newState.set('canter', List([newStart, newEnd]))
    if (newEnd > newStart) {
      newState = newState.set('canter', List([newStart, newEnd]))
    } else {
      newState = newState.set('canter', List([newStart, newStart]))
    }
    return this.updateGallop(newState, newEnd)
  }

  sliderChange (refName) {
    let newState = this.props.gaitSpeeds
    return (values) => {
      let newTrotStart = this.props.gaitSpeeds.getIn(['trot', 0])
      let newTrotEnd = this.props.gaitSpeeds.getIn(['trot', 1])
      switch (refName) {
        case 'walk':
          newState = this.updateWalk(newState, values[1])
          break
        case 'trot':
          newState = this.updateWalk(newState, values[0])
          newState = this.updateTrot(newState, values[0], values[1])
          break
        case 'canter':
          if (values[0] < this.props.gaitSpeeds.getIn(['trot', 0])) {
            newTrotStart = values[0]
          }
          if (values[0] < this.props.gaitSpeeds.getIn(['walk', 1])) {
            newState = this.updateWalk(newState, values[0])
          }
          newState = this.updateTrot(newState, newTrotStart, values[0])
          newState = this.updateCanter(newState, values[0], values[1])
          break
        case 'gallop':
          let newCanterStart = this.props.gaitSpeeds.getIn(['canter', 0])
          if (values[0] < this.props.gaitSpeeds.getIn(['canter', 0])) {
            newCanterStart = values[0]
          }

          if (values[0] < this.props.gaitSpeeds.getIn(['trot', 1])) {
            newTrotEnd = values[0]
          }
          if (values[0] < this.props.gaitSpeeds.getIn(['trot', 0])) {
            newTrotStart = values[0]
          }

          if (values[0] < this.props.gaitSpeeds.getIn(['walk', 1])) {
            newState = this.updateWalk(newState, values[0])
          }
          newState = this.updateTrot(newState, newTrotStart, newTrotEnd)
          newState = this.updateCanter(newState, newCanterStart, values[0])
          newState = this.updateGallop(newState, values[0])
          break
      }

      this.props.changeHorseGaitSpeeds(newState)
    }
  }

  slider (refName) {
    return (
      <MultiSlider
        customMarker={GaitMarker}
        customMarkerLeft={GaitMarkerLeft}
        customMarkerRight={GaitMarkerRight}
        isMarkersSeparated={true}
        ref={r => this.refs[refName] = this}
        sliderLength={width * (2.1 / 3)}
        values={this.props.gaitSpeeds.get(refName).toJS()}
        min={0}
        max={30}
        onValuesChangeFinish={this.sliderChange(refName)}
        trackStyle={{
          backgroundColor: darkGrey
        }}
        selectedStyle={{
          backgroundColor: brand
        }}
        snapped={true}
        markerOffsetY={-7}
      />
    )
  }

  render() {
    return (
      <Card>
        <CardItem header>
          <Text style={{color: darkBrand }}>Gait Speeds</Text>
        </CardItem>
        <CardItem cardBody style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
          <View style={{flex: 1}}>
            <View style={[{paddingTop: 10}, styles.sliderView]}>
              <View style={styles.sliderTextView}>
                <Text>Walk</Text>
              </View>
              { this.slider('walk') }
            </View>
            <View style={styles.sliderView}>
              <View style={styles.sliderTextView}>
                <Text>Trot</Text>
              </View>
              { this.slider('trot') }
            </View>
            <View style={styles.sliderView}>
              <View style={styles.sliderTextView}>
                <Text>Canter</Text>
              </View>
              { this.slider('canter') }
            </View>
            <View style={styles.sliderView}>
              <View style={styles.sliderTextView}>
                <Text>Gallop</Text>
              </View>
              { this.slider('gallop') }
            </View>
          </View>
        </CardItem>
      </Card>
    )
  }
}

const styles = StyleSheet.create({
  sliderView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'

  },
  sliderTextView: {
    width: width / 7
  }
})
