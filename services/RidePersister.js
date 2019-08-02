import { fromJS, Map, List } from 'immutable'

import {
  clearRidePhotoFromStash,
  rideCoordinatesLoaded,
  rideElevationsLoaded,
  rideHorseUpdated,
  ridePhotoUpdated,
  rideUpdated
} from '../actions/standard'
import functional, { catchAsyncError } from "../actions/functional"
import { coordSplice } from '../helpers'

export default class RidePersister {
  constructor (dispatch, getState, rideID, pouchService) {
    this.dispatch = dispatch
    this.getState = getState
    this.rideID = rideID
    this.pouchService = pouchService
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
    const ride = this.getRide().toJS()
    return this.pouchService.saveRide(ride).then(({ rev }) => {
      this.dispatch(rideUpdated(this.getRide().set('_rev', rev)))
    })
  }

  saveRideHorse (rideHorse) {
    return this.pouchService.saveRide(rideHorse.toJS()).then(({ rev }) => {
      this.dispatch(rideHorseUpdated(this.getRideHorse(rideHorse.get('_id')).set('_rev', rev)))
    })
  }

  saveElevations (rideElevations) {
    let theElevations = rideElevations.toJS()
    return this.pouchService.saveRide(theElevations).then(({ rev }) => {
      theElevations._rev = rev
      this.dispatch(rideElevationsLoaded(theElevations))
    })
  }

  saveCoordinates (rideCoordinates) {
    let theCoordinates = rideCoordinates.toJS()
    return this.pouchService.saveRide(theCoordinates).then(({ rev }) => {
      theCoordinates._rev = rev
      this.dispatch(rideCoordinatesLoaded(theCoordinates))
    })
  }

  persistRide (newRide, rideCoordinates, rideElevations, stashedPhotos=Map(), deletedPhotoIDs=Map(), rideHorses=Map()) {
    // Ride elevations needs to be saved before the ride so that the elevations
    // are available in the changes iterator on the server when it processes
    // the new ride for trainings.

    let docSaves = Promise.resolve()

    rideHorses.forEach((rideHorse) => {
      docSaves = docSaves.then(() => {
        return this.saveRideHorse(rideHorse)
      })
    })

    if (newRide) {
      docSaves = docSaves.then(() => {
        this.saveElevations(rideElevations)
      })
    }

    docSaves = docSaves.then(() => {
      return this.saveCoordinates(rideCoordinates).then(() => {
        return this.saveRide()
      })
    })

    stashedPhotos.forEach((stashedPhoto, photoID) => {
      const toSave = stashedPhoto.merge(Map({
        type: 'ridePhoto',
        rideID: this.rideID,
      }))
      this.dispatch(ridePhotoUpdated(toSave))
      docSaves = docSaves.then(() => {
        return this.pouchService.saveRide(toSave.toJS()).then(rideDoc => {
          this.dispatch(functional.photoNeedsUpload('ride', stashedPhoto.get('uri'), photoID))
          this.dispatch(ridePhotoUpdated(this.getRidePhoto(photoID).set('_rev', rideDoc.rev)))
          this.dispatch(clearRidePhotoFromStash(this.rideID, photoID))
        })
      })
    })

    for (let deletedPhotoID of deletedPhotoIDs) {
      const deleted = this.getRidePhoto(deletedPhotoID).set('deleted', true)
      this.dispatch(ridePhotoUpdated(deleted))
      docSaves = docSaves.then(() => {
        return this.pouchService.saveRide(deleted.toJS()).then(rideDoc => {
          this.dispatch(ridePhotoUpdated(this.getRidePhoto(deletedPhotoID).set('_rev', rideDoc.rev)))
        })
      })
    }

    return docSaves.catch(catchAsyncError(this.dispatch, 'RidePersister.persistRide'))
  }
}