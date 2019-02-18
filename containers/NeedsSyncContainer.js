import React, { PureComponent } from 'react'
import { connect } from 'react-redux';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from 'react-native';

import Button from '../components/Button'
import { brand, lightGrey } from '../colors'
import BuildImage from '../components/Images/BuildImage'
import { doSync, startListeningFCM, switchRoot } from '../actions/functional'
import { FEED } from '../screens'


class NeedsSyncContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        title: {
          text: "About",
          color: 'white',
          fontSize: 20
        },
        backButton: {
          color: 'white',
        },
        background: {
          color: brand,
        },
        elevation: 0
      }
    };
  }

  constructor (props) {
    super(props)
    this.state = {
      trying: false
    }
    this.doSync = this.doSync.bind(this)
  }

  doSync () {
    this.setState({
      trying: true
    })
    this.props.dispatch(doSync()).then(() => {
      if (this.props.syncFail) {
        this.setState({
          trying: false
        })
      } else {
        this.props.dispatch(switchRoot(FEED))
        this.props.dispatch(startListeningFCM())
      }
    })
  }

  render() {
    return (
      <View style={{height: '100%'}}>
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
              width: 120,
              height: 120,
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
          <View style={{flex: 1}}>
            <Text style={{textAlign: 'center', fontSize: 25}}>Oh No!</Text>
            <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>When you sign up, the app has to download some data, and we're having problems finishing that. Please try again when you have better service (or WiFi works best!).</Text>
            <Text style={{textAlign: 'center', fontSize: 14, paddingTop: 10}}>If you continue to have problems, please get in touch!</Text>
            <Text style={{textAlign: 'center', fontSize: 18, paddingTop: 15}}>info@equesteo.com</Text>
            <View style={{padding: 20}}>
              { this.state.trying ?
                <ActivityIndicator /> :
                <Button
                  onPress={this.doSync}
                  color={brand}
                  text={'Try Again'}
                />
              }
            </View>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightGrey,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    textAlign: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: 'red',
  }
})

function mapStateToProps (state) {
  const localState = state.get('localState')
  return {
    error: localState.get('error'),
    syncFail: localState.get('fullSyncFail')
  }
}

export default connect(mapStateToProps)(NeedsSyncContainer)
