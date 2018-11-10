import React, { PureComponent } from 'react'
import {
  Text,
} from 'native-base';
import {
  StyleSheet,
  View,
} from 'react-native';

export default class Headline extends PureComponent {
  ownerText (firstName, horseName) {
    if (firstName && horseName) {
      return (<Text style={styles.headlineRegular}>
        {`A new horse in the barn for ${firstName}: `}
        <Text style={styles.headlineBold}>
          {this.props.horse.get('name')}!
        </Text>
      </Text>)
    } else if (!firstName && horseName) {
      return (<Text style={styles.headlineRegular}>
        {`A new horse in the barn: `}
        <Text style={styles.headlineBold}>
          {this.props.horse.get('name')}!
        </Text>
      </Text>)
    } else if (firstName && !horseName) {
      return (<Text style={styles.headlineRegular}>
        {`A new horse in the barn for ${firstName}!`}
      </Text>)
    } else if (!firstName && !horseName) {
      return (<Text style={styles.headlineRegular}>
        {`A new horse!`}
      </Text>)
    }
  }

  riderText (firstName, horseName) {
    if (firstName && horseName) {
      return (
        <Text style={styles.headlineRegular}>
          {`${this.props.rider.get('firstName')} now rides `}
          <Text style={styles.headlineBold}>
            {this.props.horse.get('name')}!
          </Text>
        </Text>
      )
    } else if (!firstName && horseName) {
      return (
        <Text style={styles.headlineRegular}>
          <Text style={styles.headlineBold}>
            {this.props.horse.get('name')}
          </Text>
          {` has a new rider!`}
        </Text>
      )
    } else if (firstName && !horseName) {
      return (
        <Text style={styles.headlineRegular}>
          {`${this.props.rider.get('firstName')} is riding a new horse!`}
        </Text>
      )
    } else {
      return (
        <Text style={styles.headlineRegular}>
          {`A new rider!`}
        </Text>
      )
    }
  }

  render() {
    let headline = (
      <Text>
        {this.ownerText(this.props.rider.get('firstName'), this.props.horse.get('name'))}
      </Text>
    )
    if (this.props.rider.get('_id') !== this.props.ownerID) {
      headline = (
        <View style={{flex: 1, flexDirection: 'row'}}>
          {this.riderText(this.props.rider.get('firstName'), this.props.horse.get('name'))}
        </View>
      )
    }
    return headline
  }
}

const styles = StyleSheet.create({
  headlineRegular: {
    fontSize: 20,
    fontWeight: 'normal'
  },
  headlineBold: {
    fontSize: 20,
    fontWeight: 'bold'
  }
});
