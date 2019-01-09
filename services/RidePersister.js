import { fromJS, Map } from 'immutable'

import {
  clearRidePhotoFromStash,
  rideCoordinatesLoaded,
  rideElevationsUpdated,
  rideHorseUpdated,
  ridePhotoUpdated,
  rideUpdated
} from '../actions/standard'
import {
  needsRemotePersist,
  photoNeedsUpload,
} from "../actions/functional"
import { coordSplice } from '../helpers'
import { PouchCouch } from '../services'
import { catchAsyncError} from "../actions/functional"

export default class RidePersister {
  constructor (dispatch, getState, rideID) {
    this.dispatch = dispatch
    this.getState = getState
    this.rideID = rideID
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
    return PouchCouch.saveRide(this.getRide().toJS()).then(({ rev }) => {
      this.dispatch(rideUpdated(this.getRide().set('_rev', rev)))
    })
  }

  saveRideHorse (rideHorse) {
    return PouchCouch.saveRide(rideHorse.toJS()).then(({ rev }) => {
      this.dispatch(rideHorseUpdated(this.getRideHorse(rideHorse.get('_id')).set('_rev', rev)))
    })
  }

  saveElevations () {
    return PouchCouch.saveRide(this.getElevations().toJS()).then(({ rev }) => {
      this.dispatch(rideElevationsUpdated(this.getElevations().set('_rev', rev)))
    })
  }

  saveCoordinates (trimValues) {
    let theCoordinates = this.getCoordinates().toJS()
    if (trimValues) {
      theCoordinates.rideCoordinates = coordSplice(theCoordinates.rideCoordinates, trimValues)
    }
    return PouchCouch.saveRide(theCoordinates).then((coordinateDoc) => {
      this.dispatch(rideCoordinatesLoaded(fromJS(theCoordinates).set('_rev', coordinateDoc.rev)))
    })
  }

  persistRide (newRide, stashedPhotos, deletedPhotoIDs, trimValues, rideHorses) {
    const rideSaves = this.saveRide()

    let docSaves = rideSaves
    if (newRide) {
      docSaves = rideSaves.then(() => {
        return this.saveElevations()
      }).then(() => {
        return this.saveCoordinates()
      })
    } else if (trimValues) {
      let immutableCoordinates
      docSaves = rideSaves.then(() => {
        return PouchCouch.loadRideCoordinates(this.rideID)
      }).then((theCoordinates) => {
        theCoordinates.rideCoordinates = coordSplice(theCoordinates.rideCoordinates, trimValues)
        immutableCoordinates = fromJS(theCoordinates)
        return PouchCouch.saveRide(theCoordinates)
      }).then(rideCoordinateDoc => {
        this.dispatch(rideCoordinatesLoaded(immutableCoordinates.set('_rev', rideCoordinateDoc.rev)))
        return this.saveRide()
      })
    }

    const rideHorseSaves = []
    rideHorses.forEach((rideHorse) => {
      rideHorseSaves.push(this.saveRideHorse(rideHorse))
    })

    const newPhotoSaves = []
    stashedPhotos.forEach((stashedPhoto, photoID) => {
      const toSave = stashedPhoto.merge(Map({
        type: 'ridePhoto',
        rideID: this.rideID,
      }))
      this.dispatch(ridePhotoUpdated(toSave))
      newPhotoSaves.push(
        PouchCouch.saveRide(toSave.toJS()).then(rideDoc => {
          this.dispatch(photoNeedsUpload('ride', stashedPhoto.get('uri'), photoID))
          this.dispatch(ridePhotoUpdated(this.getRidePhoto(photoID).set('_rev', rideDoc.rev)))
          this.dispatch(clearRidePhotoFromStash(this.rideID, photoID))
        })
      )
    })

    const deletedPhotoSaves = []
    for (let deletedPhotoID of deletedPhotoIDs) {
      const deleted = this.getRidePhoto(deletedPhotoID).set('deleted', true)
      this.dispatch(ridePhotoUpdated(deleted))
      deletedPhotoSaves.push(
        PouchCouch.saveRide(deleted.toJS()).then(rideDoc => {
          this.dispatch(ridePhotoUpdated(this.getRidePhoto(deletedPhotoID).set('_rev', rideDoc.rev)))
        })
      )
    }

    rideSaves.then(() => {
      return Promise.all(docSaves)
    }).then(() => {
      return Promise.all(rideHorseSaves)
    }).then(() => {
      return Promise.all(newPhotoSaves)
    }).then(() => {
      return Promise.all(deletedPhotoSaves)
    }).then(() => {
      this.dispatch(needsRemotePersist('rides'))
    }).catch(catchAsyncError(this.dispatch))
  }
}