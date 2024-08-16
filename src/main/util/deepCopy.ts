// type ExclusionList = Array<keyof any>;

export function deepCopyObject<T extends { [key: string]: any }>(
  deep:boolean,
  object: T,
  exclusionList: Array<keyof any> = []
): T {
  if (deep) {
    const result = {} as T;
    for (const key in object) {
      if (object[key] === null || exclusionList.indexOf(key) !== -1) {
        result[key] = object[key];
      } else if (Array.isArray(object[key])) {
        result[key] = deepCopyArray(deep, object[key], exclusionList) as any;
      } else if (typeof object[key] === "object") {
        result[key] = deepCopyObject(deep, object[key], exclusionList);
      } else {
        result[key] = object[key];
      }
    }
    return result;
  } else {
    return { ...object };
  }
}

export function deepCopyArray<T extends any[]>(
  deep:boolean,
  array: T,
  exclusionList: Array<keyof any> = []
): T {
  if (deep) {
    const result = new Array(array.length) as T;
    for (let i = 0; i < array.length; i++) {
      if (array[i] === null || (exclusionList && exclusionList.indexOf(i) !== -1)) {
        result[i] = array[i];
      } else if (Array.isArray(array[i])) {
        result[i] = deepCopyArray(deep, array[i], exclusionList);
      } else if (typeof array[i] === "object") {
        result[i] = deepCopyObject(deep, array[i], exclusionList);
      } else {
        result[i] = array[i];
      }
    }
    return result;
  } else {
    return array.slice() as T;
  }
}
