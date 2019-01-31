import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native'
import Modal from 'react-native-modalbox'
import { WebView } from "react-native-webview"

const { height, width } = Dimensions.get('window')

export default class TOSModal extends PureComponent {
  render () {
    return (
      <Modal
        backButtonClose={true}
        coverScreen={true}
        style={styles.modal}
        position={"top"}
        isOpen={this.props.modalOpen}
        onClosed={this.props.onClosed}
        swipeToClose={false}
      >
        <View style={{width: '100%', height: '100%'}}>
          <WebView
            originWhitelist={['api.equesteo.com']}
            source={{ uri: "https://api.equesteo.com/legal/terms-of-service.html" }}
            style={{ margin: 10 }}
          />
        </View>
      </Modal>
    )
  }
}

TOSModal.propTypes = {
  modalOpen: PropTypes.bool.isRequired,
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.05,
    height: height * 0.8,
    width: width * .9,
  },
});
