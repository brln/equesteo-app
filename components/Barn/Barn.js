import React, { PureComponent } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
} from 'react-native';

import HorseBarnCard from './HorseBarnCard'
import NewHorseButton from './NewHorseButton'

export default class Barn extends PureComponent {
  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView>
          <View style={styles.main}>
            {
              this.props.horses.map((horse) => {
                return <HorseBarnCard
                  key={horse.get('_id')}
                  horse={horse}
                  horsePhotos={this.props.horsePhotos}
                  horseProfile={this.props.horseProfile}
                  ownerID={this.props.horseOwnerIDs.get(horse.get('_id'))}
                />
              }).toJS()
            }
            {
              <NewHorseButton
                newHorse={this.props.newHorse}
              />
            }
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 30,
    marginLeft: 10,
    marginRight: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  header: {
    padding: 20,
    fontSize: 24,
    fontWeight: 'bold'
  }
});
