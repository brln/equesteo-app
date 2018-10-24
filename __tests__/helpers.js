import { elapsedTime, haversine, bearing, timeToString } from '../helpers'

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
