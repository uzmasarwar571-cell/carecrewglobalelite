/**
 * Recursively merges `source` over `target` and returns a new object.
 *
 * Rules chosen for the CMS:
 *  - plain objects merge key by key
 *  - arrays REPLACE rather than concatenate (an admin who deletes the
 *    4th trust point means it should disappear, not linger)
 *  - `undefined` and `null` in the source are ignored, so a document
 *    missing a field falls back to the bundled default
 */
export function deepMerge(target, source) {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return source === undefined || source === null ? target : source;
  }

  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined || value === null) continue;
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function isPlainObject(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

export default deepMerge;
