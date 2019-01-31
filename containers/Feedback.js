import { Navigation } from 'react-native-navigation'
import React, { PureComponent } from 'react'
import {
  Dimensions,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { connect } from 'react-redux'

import Button from '../components/Button'
import { brand, darkBrand } from '../colors'
import UserAPI from '../services/UserApi'

const { width, height } = Dimensions.get('window')

class FeedbackContainer extends PureComponent {
  static options() {
    return {
      topBar: {
        background: {
          color: brand,
        },
        elevation: 0,
        title: {
          color: 'white',
          fontSize: 20
        },
        leftButtons: [
          {
            id: 'back',
            icon: require('../img/back-arrow.png'),
            color: 'white'
          }
        ],
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
      submitted: false
    }
    this.changeFeedback = this.changeFeedback.bind(this)
    this.submit = this.submit.bind(this)

    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'back') {
      Keyboard.dismiss()
      Navigation.popToRoot(this.props.componentId)
    }
  }

  changeFeedback (e) {
    this.setState({
      feedback: e
    })
  }

  submit () {
    UserAPI.sendFeedback(this.props.userID, this.state.feedback).then(() => {
      this.setState({
        submitted: true
      })
    }).catch(() => {
      this.setState({
        error: "Couldn't send. Maybe you don't have service?"
      })
      setTimeout(() => {
        this.setState({
          error: null
        })
      }, 3000)
    })
  }

  render() {
    const unsubmitted = (
      <ScrollView>
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
          placeholder={"Let us know what you think. Likes, dislikes, problems, feature requests, musings, anecdotes, stories, we'd love to hear it.\n\nIt sends a message straight to our phones.\n\nIf you want to hear back, let us know the best way to get in touch. Email, facebook, phone number, etc.\n\nOr come to Ben Lomond and ride with us!"}
        />
        <View style={{paddingBottom: 10}}>
          <Button color={brand} text="Submit" onPress={this.submit} />
        </View>
      </ScrollView>
    )

    const submitted = (
      <View>
        <Text>Sent! Thank you, we'll be in touch.</Text>
      </View>
    )
    return (
      <View style={{flex: 1}}>
        { this.state.error ? <View style={styles.errorBox}><Text style={{textAlign: 'center'}}>{this.state.error}</Text></View> : null }
        <View style={{flex: 1, alignItems: 'center', marginTop: 20}}>
          { this.state.submitted ? submitted : unsubmitted }
        </View>
      </View>
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
