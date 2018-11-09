import { fromJS } from 'immutable'
import { boundingBox, elapsedTime, haversine, bearing, timeToString } from '../helpers'

describe('haversine', () => {
  it('gives the distance beetween two points in miles', () => {
    expect(haversine(0, 0, 1, 1)).toEqual(97.716261)
  })
})

describe('bearing', () => {
  it('gives the bearing between two points in degrees', () => {
    expect(Math.round(bearing(0, 0, 1, 1))).toEqual(45)
  })
})

describe('elapsedTime', () => {
  it('returns the elapsed time with no pauses present', () => {
    const startTime = new Date()
    const elapsed = 10
    const currentTime = (new Date(startTime)).setSeconds(startTime.getSeconds() + elapsed)
    expect(elapsedTime(startTime, currentTime, 0, null)).toEqual(elapsed)
  })

  it('works with milliseconds present', () => {
    const startTime = new Date()
    const elapsed = 10.594
    let currentTime = new Date(startTime)
    const newSeconds = startTime.getSeconds() + (startTime.getMilliseconds() / 1000) + elapsed
    const justSeconds = Math.floor(newSeconds)
    const justMillis = (newSeconds - justSeconds) * 1000
    currentTime.setSeconds(justSeconds, justMillis)
    expect(elapsedTime(startTime, currentTime, 0, null)).toBeCloseTo(elapsed, 2)
  })

  it('works with previous pauses', () => {
    const startTime = new Date()
    const elapsed = 10.594
    let currentTime = new Date(startTime)
    const newSeconds = startTime.getSeconds() + (startTime.getMilliseconds() / 1000) + elapsed
    const justSeconds = Math.floor(newSeconds)
    const justMillis = (newSeconds - justSeconds) * 1000
    currentTime.setSeconds(justSeconds, justMillis)

    const previouslyPaused = 1.594
    expect(elapsedTime(startTime, currentTime, previouslyPaused, null)).toBeCloseTo(elapsed - previouslyPaused, 2)
  })

  it('works with a current pause', () => {
    const startTime = new Date()
    const elapsed = 25.100
    let currentTime = new Date(startTime)
    const newSeconds = startTime.getSeconds() + (startTime.getMilliseconds() / 1000) + elapsed
    const justSeconds = Math.floor(newSeconds)
    const justMillis = (newSeconds - justSeconds) * 1000
    currentTime.setSeconds(justSeconds, justMillis)

    const pauseTime = new Date(currentTime)
    const pauseElapsed = 5.2
    const pauseSeconds = pauseTime.getSeconds() + (pauseTime.getMilliseconds() / 1000) - pauseElapsed
    const justPauseSeconds = Math.floor(pauseSeconds)
    const justPauseMillis = (pauseSeconds - justPauseSeconds) * 1000
    pauseTime.setSeconds(justPauseSeconds, justPauseMillis)

    const previouslyPaused = 10.1
    expect(elapsedTime(startTime, currentTime, previouslyPaused, pauseTime)).toBeCloseTo(elapsed - previouslyPaused - pauseElapsed, 2)
  })
})

describe('timeToString', () => {
  it('works', () => {
    expect(timeToString(10)).toEqual('00:00:10')
    expect(timeToString(110)).toEqual('00:01:50')
    expect(timeToString(3671)).toEqual('01:01:11')
  })
})

describe('boundingBox', () => {
  it ('works', () => {
    const coordinates = fromJS([
      [ 66.184963, -15.259356, 1541642126000, 8 ],
      [ 66.187426, -15.26778, 1541642134000, 7.36 ],
      [ 66.190478, -15.292057, 1541642140000, 7.19 ],
      [ 66.192398, -15.322493, 1541642149000, 7.39 ],
      [ 66.184297, -15.329906, 1541642156000, 7.28 ],
      [ 66.17285, -15.343081, 1541642162000, 7.19 ],
      [ 66.159565, -15.35808, 1541642168000, 7.19 ]
    ])
    expect(boundingBox(coordinates)).toEqual([
      [-15.259356, 66.192398],
      [-15.35808, 66.159565]
    ])
  })
})
