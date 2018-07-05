import React from 'react';
import {
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native'

export default function SwipablePhoto (props) {
  return (
    <TouchableWithoutFeedback style={styles.slide}>
      <Image
        style={{width: '100%', height: '100%' }}
        source={props.source}
      />
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
});
