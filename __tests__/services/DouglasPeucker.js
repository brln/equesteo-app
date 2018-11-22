import { List } from 'immutable'
import { simplifyLine } from "../../services/DouglasPeucker"

describe('simplifyLine', () => {
  it('can deal with not having any coordinates', () => {
    expect(simplifyLine(0.1, List())).toEqual(List())
  })

  it('returns one coordinate if there\'s only one', () => {
    expect(simplifyLine(
      0.1,
      List([List([1, 1, 1, 1])])
    )).toEqual(List([List([1, 1, 1, 1])]))
  })

  it('simplifies a line', () => {
    expect(simplifyLine(
      0.1,
      List([
        List([1, 1, 1, 1]),
        List([2, 2, 2, 1]),
        List([3, 3, 3, 1]),
      ])
    )).toEqual(
      List([
        List([1, 1, 1, 1]),
        List([3, 3, 3, 1]),
      ])
    )
  })

  it('doesnt simplify a line it shouldn\'t', () => {
    expect(simplifyLine(
      0.1,
      List([
        List([0, 0, 0, 1]),
        List([-1, 1, 1, 1]),
        List([1, 1, 3, 1]),
        List([1, -1, 3, 1]),
        List([-1, -1, 3, 1])
      ])
    )).toEqual(
      List([
        List([0, 0, 0, 1]),
        List([-1, 1, 1, 1]),
        List([1, 1, 3, 1]),
        List([1, -1, 3, 1]),
        List([-1, -1, 3, 1]),
      ])
    )
  })
})
