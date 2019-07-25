import React, { PureComponent } from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { connect } from 'react-redux'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import Button from '../components/Button'
import { brand, darkBrand } from '../colors'
import UserAPI from '../services/UserApi'
import TimeoutManager from '../services/TimeoutManager'

const { width, height } = Dimensions.get('window')

class FeedbackContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        backButton: {
          color: 'white'
        },
        elevation: 0,
        title: {
          color: 'white',
          fontSize: 20
        },
      },
      layout: {
        orientation: ['portrait']
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      feedback: null,
      submitted: false,
      disableSubmit: true
    }
    this.changeFeedback = this.changeFeedback.bind(this)
    this.submit = this.submit.bind(this)

    this.clearErrorTimeout = null
  }

  componentWillUnmount () {
    TimeoutManager.deleteTimeout(this.clearErrorTimeout)
  }

  changeFeedback (e) {
    this.setState({
      feedback: e,
      disableSubmit: false,
    })
  }

  submit () {
    this.setState({
      disableSubmit: true
    })
    UserAPI.sendFeedback(this.props.userID, this.state.feedback).then(() => {
      this.setState({
        submitted: true
      })
    }).catch(() => {
      this.setState({
        error: "Couldn't send. Maybe you don't have service?",
        disableSubmit: false
      })
      this.clearErrorTimeout = TimeoutManager.newTimeout(() => {
        this.setState({
          error: null
        })
      }, 3000)
    })
  }

  render() {
    const unsubmitted = (
      <View>
        <TextInput
          style={{
            width: width * 0.8,
            height: height * 0.6,
            padding: 10,
            borderColor: darkBrand,
            borderWidth: 1,
            textAlignVertical: "top"
          }}
          value={this.state.feedback}
          onChangeText={this.changeFeedback}
          multiline={true}
          underlineColorAndroid="transparent"
          maxLength={5000}
          placeholder={"Let us know what you think. Likes, dislikes, problems, feature requests, musings, anecdotes, stories, we'd love to hear it.\n\nIt sends a message straight to our phones.\n\nWe'll email you back at the address you signed up with, let us know if there's a better way to reach you.\n\nOr come to Ben Lomond and ride with us!"}
        />
        <View style={{paddingBottom: 10}}>
          <Button disabled={this.state.disableSubmit} color={brand} text="Submit" onPress={this.submit} />
        </View>
      </View>
    )

    const submitted = (
      <View>
        <Text>Sent! Thank you, we'll be in touch.</Text>
      </View>
    )
    return (
      <KeyboardAwareScrollView style={{height}} enableAutomaticScroll={false}>
        { this.state.error ? <View style={styles.errorBox}><Text style={{textAlign: 'center'}}>{this.state.error}</Text></View> : null }
        <View style={{flex: 1, alignItems: 'center', marginTop: 20, height: height + 60}}>
          { this.state.submitted ? submitted : unsubmitted }
        </View>
      </KeyboardAwareScrollView>
    )
  }
}

const styles = StyleSheet.create({
  errorBox: {
    position: 'absolute',
    height: 20,
    top: 0,
    backgroundColor: 'red',
    width: '100%'
  }
});

function mapStateToProps (state, passedProps) {
  const localState = state.get('localState')
  const userID = localState.get('userID')
  return { userID }
}

export default connect(mapStateToProps)(FeedbackContainer)
