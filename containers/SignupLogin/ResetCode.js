import React, { PureComponent } from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'

import EmailInfoModal from '../../components/SignupLogin/EmailInfoModal'
import SubmittedForm from '../../components/SignupLogin/SubmittedForm'
import PageWrapper from '../../components/SignupLogin/PageWrapper'
import {
  dismissError,
  errorOccurred,
} from '../../actions/standard'
import { exchangePWCode, switchRoot } from '../../actions/functional'
import {NEW_PASSWORD} from "../../screens/consts/main"
import EqNavigation from '../../services/EqNavigation'

const { height, width } = Dimensions.get('window');

class ResetCodeContainer extends PureComponent {
  static options() {
    return {
      layout: {
        orientation: ['portrait']
      },
      topBar: {
        visible: false,
        drawBehind: true,
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      resetCode: null,
      emailInfoModalOpen: false,
    }
    this.changeResetCode = this.changeResetCode.bind(this)
    this.setEmailInfoModalOpen = this.setEmailInfoModalOpen.bind(this)
    this.submitResetCode = this.submitResetCode.bind(this)
  }

  componentDidUpdate (nextProps) {
    if (this.props.error) {
      setTimeout(() => {
        this.props.dispatch(dismissError())
      }, 3000)
    }
  }

  setEmailInfoModalOpen (value) {
    this.setState({
      emailInfoModalOpen: value
    })
  }

  changeResetCode (text) {
    this.setState({
      resetCode: text
    })
  }

  submitResetCode () {
    this.props.dispatch(dismissError())
    this.props.dispatch(exchangePWCode(this.props.forgotEmail, this.state.resetCode)).then(() => {
      EqNavigation.push(this.props.componentId, {
        component: {
          name: NEW_PASSWORD
        }
      })
    }).catch(e => {
      this.props.dispatch(errorOccurred(e.message))
    })
  }

  render() {
    return (
      <PageWrapper
        error={this.props.error}
      >
        <View style={styles.container}>
          <View style={styles.container}>
            <EmailInfoModal
              modalOpen={this.state.emailInfoModalOpen}
              closeModal={() => {this.setEmailInfoModalOpen(false)}}
            />
            <SubmittedForm
              changeResetCode={this.changeResetCode}
              resetCode={this.state.resetCode}
              setEmailInfoModalOpen={this.setEmailInfoModalOpen}
              submitResetCode={this.submitResetCode}
            />
          </View>
        </View>
      </PageWrapper>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    width,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 30,
  },
  switchup: {
    paddingTop: 10,
    paddingBottom: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  switchupText: {
    textAlign: 'center',
    fontSize: 12,
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
})

function mapStateToProps (state, passedProps) {
  const localState = state.get('localState')
  return {
    awaitingPWChange: localState.get('awaitingPWChange'),
    doingInitialLoad: localState.get('doingInitialLoad'),
    docsToDownload: localState.get('docsToDownload'),
    docsDownloaded: localState.get('docsDownloaded'),
    forgotEmail: localState.get('forgotEmail'),
    error: localState.get('error'),
  }
}

export default connect(mapStateToProps)(ResetCodeContainer)
