import { isArray, isObject } from '@/utils'

describe('isArray', () => {
  it.each([
    [[], true],
    [[1, 2, 3], true],
    [{}, false],
    [{id: 1}, false],
    ['dummy', false],
    [1, false],
    [undefined, false],
    [null, false],
    [true, false],
    [NaN, false],
    [function (){}, false],
    [new Promise(()=>{}), false],
    [Symbol(), false],
    [new Map(), false],
    [new Set(), false],
  ])('returns true if the argument(%j) is Array', (arg, result) => {
    expect(isArray(arg)).toBe(result)
  })
})

describe('isObject', () => {
  it.each([
    [[], false],
    [[1, 2, 3], false],
    [{}, true],
    [{id: 1}, true],
    ['dummy', false],
    [1, false],
    [undefined, false],
    [null, false],
    [true, false],
    [NaN, false],
    [function (){}, false],
    [new Promise(()=>{}), false],
    [Symbol(), false],
    [new Map(), false],
    [new Set(), false],
  ])('returns true if the argument(%j) is Object', (arg, result) => {
    expect(isObject(arg)).toBe(result)
  })
})
