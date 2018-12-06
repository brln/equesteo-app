import { fromJS, Map } from 'immutable'

import {
  enqueuePhoto,
  rideCoordinatesLoaded,
  rideElevationsUpdated,
  rideHorseUpdated,
  ridePhotoUpdated,
  rideUpdated
} from '../actions/standard'
import {
  needsRemotePersist,
} from "../actions/functional"
import { coordSplice } from '../helpers'
import { PouchCouch } from '../services'
import { catchAsyncError} from "../actions/functional"

export default class RidePersister {
  constructor (dispatch, getState, rideID) {
    this.dispatch = dispatch
    this.getState = getState
    this.rideID = rideID
    this.pouchCouch = new PouchCouch(getState().getIn(['localState', 'jwt']))
  }

  getCoordinates () {
    return this.getState().getIn(['pouchRecords', 'newRideCoordinates'])
  }

  getElevations () {
    return this.getState().getIn(['pouchRecords', 'rideElevations', this.rideID + '_elevations'])
  }

  getRide () {
    return this.getState().getIn(['pouchRecords', 'rides', this.rideID])
  }

  getRideHorse(rideHorseID) {
    return this.getState().getIn(['pouchRecords', 'rideHorses', rideHorseID])
  }

  getRidePhoto (photoID) {
    return this.getState().getIn(['pouchRecords', 'ridePhotos', photoID])
  }

  saveRide () {
    return this.pouchCouch.saveRide(this.getRide().toJS()).then(({ rev }) => {
      this.dispatch(rideUpdated(this.getRide().set('_rev', rev)))
    })
  }

  saveRideHorse (rideHorse) {
    return this.pouchCouch.saveRide(rideHorse.toJS()).then(({ rev }) => {
      this.dispatch(rideHorseUpdated(this.getRideHorse(rideHorse.get('_id')).set('_rev', rev)))
    })
  }

  saveElevations () {
    return this.pouchCouch.saveRide(this.getElevations().toJS()).then(({ rev }) => {
      this.dispatch(rideElevationsUpdated(this.getElevations().set('_rev', rev)))
    })
  }

  saveCoordinates (trimValues) {
    let theCoordinates = this.getCoordinates().toJS()
    if (trimValues) {
      theCoordinates.rideCoordinates = coordSplice(theCoordinates.rideCoordinates, trimValues)
    }
    return this.pouchCouch.saveRide(theCoordinates).then((coordinateDoc) => {
      this.dispatch(rideCoordinatesLoaded(fromJS(theCoordinates).set('_rev', coordinateDoc.rev)))
    })
  }

  persistRide (newRide, stashedPhotos, deletedPhotoIDs, trimValues, rideHorses) {
    const rideSaves = this.saveRide()

    if (newRide) {
      rideSaves.then(() => {
        return this.saveElevations()
      }).then(() => {
        return this.saveCoordinates()
      })
    } else if (trimValues) {
      let immutableCoordinates
      rideSaves.then(() => {
        return this.pouchCouch.loadRideCoordinates(this.rideID)
      }).then((theCoordinates) => {
        theCoordinates.rideCoordinates = coordSplice(theCoordinates.rideCoordinates, trimValues)
        immutableCoordinates = fromJS(theCoordinates)
        return this.pouchCouch.saveRide(theCoordinates)
      }).then(rideCoordinateDoc => {
        this.dispatch(rideCoordinatesLoaded(immutableCoordinates.set('_rev', rideCoordinateDoc.rev)))
        return this.saveRide()
      })
    }

    rideHorses.forEach((rideHorse) => {
      rideSaves.then(() => {
        return this.saveRideHorse(rideHorse)
      })
    })

    stashedPhotos.forEach((stashedPhoto, photoID) => {
      rideSaves.then(() => {
        const toSave = stashedPhoto.merge(Map({
          type: 'ridePhoto',
          rideID: this.rideID,
        }))
        this.dispatch(ridePhotoUpdated(toSave))
        this.dispatch(enqueuePhoto(Map({
          type: 'ride',
          photoLocation: stashedPhoto.get('uri'),
          photoID,
          rideID: this.rideID,
        })))
        return this.pouchCouch.saveRide(toSave.toJS()).then(rideDoc => {
          this.dispatch(ridePhotoUpdated(this.getRidePhoto(photoID).set('_rev', rideDoc.rev)))
        })
      })
    })

    for (let deletedPhotoID of deletedPhotoIDs) {
      const deleted = this.getRidePhoto(deletedPhotoID).set('deleted', true)
      this.dispatch(ridePhotoUpdated(deleted))
      rideSaves.then(() => {
        return this.pouchCouch.saveRide(deleted.toJS()).then(rideDoc => {
          this.dispatch(ridePhotoUpdated(this.getRidePhoto(deletedPhotoID).set('_rev', rideDoc.rev)))
        })
      })
    }

    rideSaves.then(() => {
      this.dispatch(needsRemotePersist('rides'))
    }).catch(catchAsyncError)
  }
}