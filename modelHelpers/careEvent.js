import { timeToString } from '../helpers'


function renderFeeds (feedData) {
    const allText = []
    for (let row of feedData.feedRows) {
      allText.push(`${row.amount} ${row.unit}${row.unit > 1 ? 's' : ''} of ${row.feed}`)
    }
    return allText.join(', ')
}

export function eventDetails (careEvent) {
  const details = {
    title: null,
    content: null,
    icon: null,
  }
  if (careEvent.mainEventType === 'Feed') {
    details.title = 'Feed'
    details.content = renderFeeds(careEvent.eventSpecificData)
    details.icon = require('../img/careCalendar/clr-hay.png')
  } else if (careEvent.mainEventType === 'Groundwork' && careEvent.secondaryEventType !== 'Carrot Stretches' && careEvent.secondaryEventType !== 'Other') {
    details.title = careEvent.secondaryEventType
    details.content = `Total Time: ${timeToString(careEvent.eventSpecificData.elapsedTime)}`
    details.icon = require('../img/careCalendar/clr-arena.png')
  } else if (careEvent.mainEventType === 'Groundwork' && careEvent.secondaryEventType === 'Carrot Stretches') {
    details.title = careEvent.secondaryEventType
    details.content = `${careEvent.eventSpecificData.counterNumber} stretches`
    details.icon = require('../img/careCalendar/clr-arena.png')
  } else if (careEvent.mainEventType === 'Groundwork' && careEvent.secondaryEventType === 'Other') {
    details.title = `${careEvent.eventSpecificData.otherType || 'Groundwork'}`
    details.content = `Total Time: ${timeToString(careEvent.eventSpecificData.elapsedTime)}`
    details.icon = require('../img/careCalendar/clr-arena.png')
  } else if (careEvent.mainEventType === 'Farrier' && careEvent.secondaryEventType !== 'Other') {
    details.title = careEvent.secondaryEventType
    details.icon = require('../img/careCalendar/clr-horseshoe.png')
    details.content = careEvent.eventSpecificData.notes
  } else if (careEvent.mainEventType === 'Farrier' && careEvent.secondaryEventType === 'Other') {
    details.title = `${careEvent.eventSpecificData.otherType || 'Farrier'}`
    details.icon = require('../img/careCalendar/clr-horseshoe.png')
    details.content = careEvent.eventSpecificData.notes
  } else if (careEvent.mainEventType === 'Veterinary' && careEvent.secondaryEventType !== 'Other') {
    details.title = careEvent.secondaryEventType
    details.icon = require('../img/careCalendar/clr-medical.png')
    details.content = careEvent.eventSpecificData.notes
  } else if (careEvent.mainEventType === 'Veterinary' && careEvent.secondaryEventType === 'Other') {
    details.title = `${careEvent.eventSpecificData.otherType || 'Veterinary'}`
    details.icon = require('../img/careCalendar/clr-medical.png')
    details.content = careEvent.eventSpecificData.notes
  } else {
    details.title = careEvent.secondaryEventType
    details.content = ''
    details.icon = null
  }
  return details
}