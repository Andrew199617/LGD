function red(str) {
  return `\x1b[31m${str}\x1b[0m`;
}

/**
 * @description Helps with implementing Objects Linked to Other Objects Pattern. No need for this bindings. Also lets you keep your getters and setters as apposed to using Objects.assign. 
 * @see https://www.learngamedevelopment.net/blog/oloo(objectslinkingtootherobjects)
 * @class OlooConstructor
 */
const Oloo = {
  /**
   * @description Helps keep track of what level we are for a function. This way we can always call the function with the intial instance but continually go down the chain of inheritance.
   */
  objectMap: new Map(),

  create: Object.create,

  createSlow(obj) {
    Oloo.assignSlow({}, obj);
  },

  assign(baseObj, obj) {
    const newObj = Object.create(obj);
    const oldProto = Object.getPrototypeOf(baseObj);
    const newProto = Object.getPrototypeOf(newObj);

    if(process.env.NODE_ENV !== 'production') {
      if(obj.constructor === Object.prototype.constructor && obj.displayName) {
        var fnNameRegex = /^[$A-Z_][0-9A-Z_$]*$/i;
        if(fnNameRegex.test(obj.displayName)) {
          console.warn('\x1b[33mOLOO: displayName must be a valid function name.\x1b[0m')
        }
        else {
          eval(`Object.defineProperty(obj, 'constructor', { value: (function ${obj.displayName}() {}).bind(null), writable: false, enumerable: false, configurable: false });`);
        }
      }
    }

    Object.setPrototypeOf(newProto, oldProto);
    Object.setPrototypeOf(baseObj, newProto);
    return baseObj;
  },
  
  assignWithSymbols(baseObj, obj) {
    baseObj = Oloo.assign(baseObj, obj);
    
    let descriptors = [];
    // by default, Object.assign copies enumerable Symbols too
    Object.getOwnPropertySymbols(obj)
      .forEach(sym => {
        let descriptor = Object.getOwnPropertyDescriptor(obj, sym);
        if (descriptor.enumerable) {
          descriptors[sym] = descriptor;
        }
      });

    Object.defineProperties(baseObj, descriptors);
  
    return baseObj;
  },

  assignSlow(baseObj, obj) {  
    const oldProto = Object.getPrototypeOf(baseObj);
    const newProto = Object.create(oldProto);

    let descriptors = Object.keys(obj)
      .reduce((descriptors, key) => {
        const descriptor = Object.getOwnPropertyDescriptor(obj, key);

        if(typeof descriptor.get === 'undefined' && typeof descriptor.set === 'undefined') {
          newProto[key] = obj[key];
          return descriptors;
        }

        descriptors[key] = descriptor;
        return descriptors;
      }, {});
    Object.setPrototypeOf(baseObj, newProto);
      
    if(process.env.NODE_ENV !== 'production') {
      if(obj.constructor === Object.prototype.constructor && obj.displayName) {
        var fnNameRegex = /^[$A-Z_][0-9A-Z_$]*$/i;
        if(fnNameRegex.test(obj.displayName)) {
          console.warn('\x1b[33mOLOO: displayName must be a valid function name.\x1b[0m')
        }
        else {
          eval(`Object.defineProperty(obj, 'constructor', { value: (function ${obj.displayName}() {}).bind(null), writable: false, enumerable: false, configurable: false });`);
        }
      }
    }

    Object.defineProperties(baseObj, descriptors);
    
    return baseObj;
  },

  base(obj, funcName, ...params) {
    funcName = typeof funcName === 'function' ? funcName.name : funcName;
    
    let parent = obj;

    let currentObjectInstance = Oloo.objectMap.get(obj);
    if(currentObjectInstance) {
      // Keeps track of how far down the inheritance tree we are for a give function. Start from scratch if we called a different function.
      obj = currentObjectInstance[funcName] || obj;
    }

    parent = Object.getPrototypeOf(obj);

    while(!parent.hasOwnProperty(funcName)) {
      // Start with the first base object that has the function. This will also ignore the first base objects func if we are calling the method without base since that will be the function we are calling this from.
      parent = Object.getPrototypeOf(parent);
    }

    if(!obj.hasOwnProperty("__parent__")) {
      // We ignore the first prototype since that is still the same object.
      parent = Object.getPrototypeOf(parent);
    }

    if(!parent.hasOwnProperty("__parent__")) {
      Object.defineProperty(parent, '__parent__', {
        writable: false,
        configurable: false,
        enumerable: false,
        value: true
      })
    }
    
    if(currentObjectInstance) {
      currentObjectInstance[funcName] = parent;
    }
    else {
      currentObjectInstance = { obj, [funcName]: parent };
      Oloo.objectMap.set(obj, currentObjectInstance);
    }

    if(!parent.hasOwnProperty(funcName)) {
      return Oloo._base(obj, parent, funcName, ...params);
    }

    const ret = parent[funcName].bind(currentObjectInstance.obj)(...params);

    if(currentObjectInstance.obj) {
      Oloo.objectMap.delete(currentObjectInstance.obj);
    }

    return ret;
  },
  
  _base(objInstance, obj, funcName, ...params) {
    let parent = Object.getPrototypeOf(obj);

    while(!parent.hasOwnProperty(funcName)) {
      // Get parent that has func to call.
      parent = Object.getPrototypeOf(parent);
    }

    if(!parent.hasOwnProperty("__parent__")) {
      Object.defineProperty(parent, '__parent__', {
        writable: false,
        configurable: false,
        enumerable: false,
        value: true
      })
    }
    
    let currentObjectInstance = Oloo.objectMap.get(objInstance);
    // Keeps track of last base class to call function.
    currentObjectInstance[funcName] = parent;

    const ret = parent[funcName].bind(currentObjectInstance.obj)(...params);

    if(currentObjectInstance.obj) {
      Oloo.objectMap.delete(currentObjectInstance.obj);
    }

    return ret;
  }
}

/**
* @description Public facing class.
* @type {LGDType}
*/
const LGD = {
  /**
  * @description Setup Oloo as a global variable so you don't have to import it in every class.
  */
  setup() {
    if(typeof window !== 'undefined') {
      window.Oloo = Oloo;
    }
    else if(typeof global !== 'undefined') {
      global.Oloo = Oloo;
    }
    else {
      console.error(red('Could not polyfill Oloo.'));
    }
  },

  Oloo
};

module.exports = LGD;