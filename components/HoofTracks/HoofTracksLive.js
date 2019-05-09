import moment from 'moment'
import React, { PureComponent } from 'react'
import { Share, Text, TextInput, View } from 'react-native'

import { brand, danger, darkBrand } from '../../colors'
import Button from '../../components/Button'

export default class HoofTracksLive extends PureComponent {
  constructor (props) {
    super(props)
    this.timerRefresh = null
  }

  componentDidMount () {
    if (this.props.hoofTracksRunning) {
      this.timerRefresh = setInterval(() => {
        this.forceUpdate()
      }, 10000)
    }
  }

  componentWillUnmount () {
    clearInterval(this.timerRefresh)
  }

  render() {
    let mainText = <Text style={{textAlign: 'center'}}>Your ride will be broadcast live with ID:</Text>
    if (this.props.hoofTracksRunning) {
      mainText = (
        <View>
          <Text style={{textAlign: 'center'}}>Broadcasting Live!</Text>
        </View>
      )
    }
    if (this.props.hoofTracksRunning && this.props.lastHoofTracksUpload) {
      mainText = (
        <View>
          <Text style={{textAlign: 'center'}}>Broadcasting Live! Last successful update: </Text>
          <Text style={{fontWeight: 'bold', textAlign: 'center'}}>{moment(this.props.lastHoofTracksUpload).fromNow()}</Text>
        </View>
      )
    }
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 20, paddingRight: 20, marginTop: 20}}>
          <View style={{flex: 1, justifyContent: 'center'}}>
            { mainText }
          </View>
          <View style={{flex: 1}}>
            <View style={{flex: 1}}>
              <Text style={{fontFamily: 'courier', fontSize: 40, textAlign: 'center'}}>{this.props.hoofTracksID}</Text>
            </View>
            <View style={{flex: 1}}>
              <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', width: 300}}>
                <View style={{marginRight: 10}} >
                  <Button text={"Reset Code"} color={danger} onPress={this.props.resetCode}/>
                </View>
                <View style={{marginLeft: 10 }}>
                  <Button text={"Share"} color={brand} onPress={this.props.shareLink}/>
                </View>
              </View>
            </View>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{marginBottom: 10}}>
              <Text style={{textAlign: 'center'}}>Anyone with this id can follow your ride at: </Text>
            </View>
            <TextInput
              style={{width: '100%', height: 50, padding: 10, borderColor: darkBrand, borderWidth: 1, borderRadius: 4}}
              selectTextOnFocus={true}
              underlineColorAndroid={'transparent'}
              value={`https://equesteo.com/hoofTracks?c=${this.props.hoofTracksID}`}
            />
          </View>
        </View>
      </View>
    )
  }
}
