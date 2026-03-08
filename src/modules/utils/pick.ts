const pick = <T extends Record<string, any>, K extends keyof T>(object: T, keys: K[]): Partial<T> =>
  keys.reduce((obj: Partial<T>, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});

export default pick;
