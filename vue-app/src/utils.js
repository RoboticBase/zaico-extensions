function typeOf(t) {
  return Object.prototype.toString.call(t).slice(8, -1).toLowerCase()
}

function isArray(t) {
  return Array.isArray(t)
}

function isObject(t) {
  return typeOf(t) == 'object'
}

export {isArray, isObject}
