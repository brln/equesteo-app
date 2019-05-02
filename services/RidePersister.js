import { fromJS, Map } from 'immutable'

import {
  clearRidePhotoFromStash,
  rideCoordinatesLoaded,
  rideElevationsLoaded,
  rideHorseUpdated,
  ridePhotoUpdated,
  rideUpdated
} from '../actions/standard'
import {
  doSync,
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
    return this.getState().getIn(['pouchRecords', 'selectedRideCoordinates'])
  }

  getElevations () {
    return this.getState().getIn(['pouchRecords', 'selectedRideElevations'])
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
      logDebug('rideSaved')
      this.dispatch(rideUpdated(this.getRide().set('_rev', rev)))
    })
  }

  saveRideHorse (rideHorse) {
    return PouchCouch.saveRide(rideHorse.toJS()).then(({ rev }) => {
      logDebug('rideHorseSaved')
      this.dispatch(rideHorseUpdated(this.getRideHorse(rideHorse.get('_id')).set('_rev', rev)))
    })
  }

  saveElevations () {
    let theElevations = this.getElevations().toJS()
    return PouchCouch.saveRide(theElevations).then(({ rev }) => {
      theElevations._rev = rev
      this.dispatch(rideElevationsLoaded(theElevations))
    })
  }

  saveCoordinates () {
    let theCoordinates = this.getCoordinates().toJS()
    return PouchCouch.saveRide(theCoordinates).then(({ rev }) => {
      theCoordinates._rev = rev
      this.dispatch(rideCoordinatesLoaded(theCoordinates))
    })
  }

  persistRide (newRide, stashedPhotos, deletedPhotoIDs, trimValues, rideHorses) {
    // Ride elevations needs to be saved before the ride so that the elevations
    // are available in the changes iterator on the server when it processes
    // the new ride for trainings.

    let docSaves = Promise.resolve()
    if (newRide) {
      docSaves = this.saveElevations().then(() => {
        return this.saveCoordinates()
      })
    } else if (trimValues) {
      let immutableCoordinates
      docSaves = PouchCouch.loadRideCoordinates(this.rideID).then((theCoordinates) => {
        theCoordinates.rideCoordinates = coordSplice(theCoordinates.rideCoordinates, trimValues)
        immutableCoordinates = fromJS(theCoordinates)
        return PouchCouch.saveRide(theCoordinates)
      }).then(rideCoordinateDoc => {
        this.dispatch(rideCoordinatesLoaded(immutableCoordinates.set('_rev', rideCoordinateDoc.rev)))
        return this.saveRide()
      })
    }
    docSaves = docSaves.then(() => {
      return this.saveRide()
    })

    rideHorses.forEach((rideHorse) => {
      docSaves = docSaves.then(() => {
        return this.saveRideHorse(rideHorse)
      })
    })

    stashedPhotos.forEach((stashedPhoto, photoID) => {
      logDebug('saving stashed Photos')
      const toSave = stashedPhoto.merge(Map({
        type: 'ridePhoto',
        rideID: this.rideID,
      }))
      this.dispatch(ridePhotoUpdated(toSave))
      docSaves = docSaves.then(() => {
        return PouchCouch.saveRide(toSave.toJS()).then(rideDoc => {
          this.dispatch(photoNeedsUpload('ride', stashedPhoto.get('uri'), photoID))
          this.dispatch(ridePhotoUpdated(this.getRidePhoto(photoID).set('_rev', rideDoc.rev)))
          this.dispatch(clearRidePhotoFromStash(this.rideID, photoID))
        })
      })
    })

    for (let deletedPhotoID of deletedPhotoIDs) {
      logDebug('saving deleted photos')
      const deleted = this.getRidePhoto(deletedPhotoID).set('deleted', true)
      this.dispatch(ridePhotoUpdated(deleted))
      docSaves = docSaves.then(() => {
        return PouchCouch.saveRide(deleted.toJS()).then(rideDoc => {
          this.dispatch(ridePhotoUpdated(this.getRidePhoto(deletedPhotoID).set('_rev', rideDoc.rev)))
        })
      })
    }

    return docSaves.then(() => {
      logDebug('doc saves then doSync!')
      return this.dispatch(doSync())
    }).catch(catchAsyncError(this.dispatch))
  }
}