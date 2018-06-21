import moment from 'moment'
import Modal from 'react-native-modalbox';
import { Navigation } from 'react-native-navigation'
import React, { Component } from 'react'
import Swiper from 'react-native-swiper';

import {
  Button,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { MAP, UPDATE_RIDE } from '../../screens'
import PhotosByTimestamp from '../PhotosByTimestamp'
import SpeedChart from './SpeedChart'
import Stats from './Stats'
import DeleteModal from './DeleteModal'

const { width } = Dimensions.get('window')

export default class Ride extends Component {
  constructor (props) {
    super(props)
    this.state = {
      modalOpen: false
    }
    this.closeDeleteModal = this.closeDeleteModal.bind(this)
    this.deleteRide = this.deleteRide.bind(this)
    this.fullscreenMap = this.fullscreenMap.bind(this)

    this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'dropdown') {
       this.props.navigator.showContextualMenu(
          {
            rightButtons: [
              {
                title: 'Edit',
              },
              {
                title: 'Delete',
              }
            ],
            onButtonPressed: (index) => {
              if (index === 0) {
                this.props.navigator.dismissAllModals()
                this.props.navigator.push({
                  screen: UPDATE_RIDE,
                  title: 'Update Ride',
                  passProps: {
                    rideID: this.props.ride._id
                  },
                  navigatorStyle: {},
                  navigatorButtons: {},
                  animationType: 'slide-up',
                });
              } else if (index === 1) {
                this.setState({modalOpen: true})
              }
            }
          }
        );
      }
    }
  }



  fullscreenMap () {
    this.props.navigator.push({
      screen: MAP,
      title: 'Map',
      animationType: 'slide-up',
      passProps: {
        rideID: this.props.ride._id
      }
    })
  }

  closeDeleteModal () {
    this.setState({
      modalOpen: false
    })
  }

  deleteRide () {
    this.props.deleteRide()
    this.props.navigator.popToRoot()
  }

  render () {
    let speedChart = <Text>Not enough points for Speed Chart</Text>
    if (this.props.ride.rideCoordinates.length > 2) {
      speedChart = (
        <View style={styles.slide}>
          <SpeedChart
            rideCoordinates={this.props.ride.rideCoordinates}
          />
        </View>
      )
    }
    return (
      <View style={{flex: 1}}>
        <DeleteModal
          modalOpen={this.state.modalOpen}
          closeDeleteModal={this.closeDeleteModal}
          deleteRide={this.deleteRide}
        />
        <View style={{flex: 1}}>

          <View style={{flex: 1}}>
            <Swiper
              loop={false}
            >
              <TouchableWithoutFeedback style={styles.slide}
                onPress={this.fullscreenMap}
              >
                <Image style={styles.image} source={{uri: this.props.ride.mapURL }} />
              </TouchableWithoutFeedback>
              { speedChart }
            </Swiper>
          </View>
          <View style={{flex: 1}}>
            <View style={{flex: 1}}>
              <Stats
                ride={this.props.ride}
                horses={this.props.horses}
              />
            </View>
            <ScrollView style={{flex: 1}}>
              <PhotosByTimestamp
                photosByID={this.props.ride.photosByID}
                profilePhotoID={this.props.ride.profilePhotoID}
              />
            </ScrollView>
          </View>
        </View>
      </View>
    )
  }


  renderp() {
    return (
      <ScrollView>
        <Modal
          style={[styles.modal, styles.modal3]}
          position={"top"}
          isOpen={this.state.modalOpen}
          onClosed={this.closeDeleteModal}
        >
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>Are you sure you want to delete this ride?</Text>
          </View>
          <View style={{flex: 1, flexDirection: 'row', height: 20, alignItems: 'center'}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
              <View style={{margin: 20}} >
                <Button title={"Yes"} color={"red"} onPress={this.deleteRide}/>
              </View>
              <View style={{margin: 20}} >
                <Button title={"No"} onPress={this.closeDeleteModal}/>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.container}>
          <View style={{flex: 3}}>
            <Swiper>
              <View style={styles.slide1}>
                <Text>Hello swiper</Text>
                {/*<TouchableOpacity*/}
                  {/*onPress={this.fullscreenMap}*/}
                {/*>*/}
                  {/*<Image*/}
                    {/*source={{uri: this.props.ride.mapURL }}*/}
                    {/*style={{height: 250, width: null, flex: 1}}*/}
                  {/*/>*/}
                {/*</TouchableOpacity>*/}
              </View>
              <View style={styles.slide1}>
                <Text>Hello swiper</Text>
              </View>
            </Swiper>
          </View>
          <View style={{flex: 1, padding: 5}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flex: 1}}>
                <Text>Horse:</Text>
                <Text style={styles.statFont}>{this.whichHorse()}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text>Start Time:</Text>
                <Text style={styles.statFont}>{moment(this.props.ride.startTime).format('h:mm a')}</Text>
              </View>
            </View>

            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flex: 1}}>
                <Text>Total Time Riding:</Text>
                <Text style={styles.statFont}>{ moment.utc(this.props.ride.elapsedTimeSecs * 1000).format('HH:mm:ss') }</Text>
              </View>

              <View style={{flex: 1}}>
                <Text>Distance:</Text>
                <Text style={styles.statFont}>{ this.props.ride.distance.toFixed(2) } mi</Text>
              </View>
            </View>
          </View>
          <View>
            <SpeedChart
              rideCoordinates={this.props.ride.rideCoordinates}
            />
            <PhotosByTimestamp
              photosByID={this.props.ride.photosByID}
              profilePhotoID={this.props.ride.profilePhotoID}
            />
          </View>
        </View>
      </ScrollView>
    )
  }
}




const styles = StyleSheet.create({
  wrapper: {
    width,
    flex: 1
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold'
  },
  image: {
    width,
    flex: 1
},
});
