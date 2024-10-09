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
   * @description Helps keep track of what level we are for a function. This way we can always call the function with the initial instance but continually go down the chain of inheritance.
   */
  objectMap: new Map(),

  /**
   * @description Creates an object that has the specified prototype or that has null prototype.
   * @param o Object to use as a prototype. May be null.
   */
  create: Object.create,

  /**
  * @description Creates an object that has the specified prototype or that has null prototype.
  * Keeps the getters and setters working properly.
  * @param o Object to use as a prototype. May be null.
  */
  createSlow(obj) {
    Oloo.assignSlow({}, obj);
  },

  /**
  * @description Setup the inheritance chain for an object.
  */
  assign(baseObj, obj) {
    const newObj = Object.create(obj);
    const oldProto = Object.getPrototypeOf(baseObj);
    const newProto = Object.getPrototypeOf(newObj);

    Oloo._addDebugConstructor(obj);

    Object.setPrototypeOf(newProto, oldProto);
    Object.setPrototypeOf(baseObj, newProto);
    return baseObj;
  },

  /**
  * @description add constructor to obj, helpful for debugging. It shows up in errors.
  * @param {Object} baseObj The base object that Obj inherits from.
  * @param {Object} obj The Obj to create an instance for.
  */
  _addDebugConstructor(obj) {
    if(process.env.NODE_ENV !== 'production') {
      if(obj.constructor === Object.prototype.constructor && obj.displayName) {
        var fnNameRegex = /^[A-Z_][0-9A-Z_]*$/i;
        if(!fnNameRegex.test(obj.displayName)) {
          console.warn('\x1b[33mOLOO: displayName must be a valid function name.\x1b[0m')
        }
        else {
          eval(`Object.defineProperty(obj, 'constructor', { value: (function ${obj.displayName}() {}).bind(null), writable: false, enumerable: false, configurable: false });`);
        }
      }
    }
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

  /**
  * @description Assign an object and keep the get and sets for the object.
  * @param {Object} baseObj The base object that Obj inherits from.
  * @param {Object} obj The Obj to create an instance for.
  */
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

    Oloo._addDebugConstructor(obj);

    Object.defineProperties(baseObj, descriptors);

    return baseObj;
  },

  /**
   * @description Calls the base method (parent method in prototype chain) for the given object.
   * Automatically detects the calling function's name, eliminating the need to pass it.
   * 
   * @param {Object} obj - The object instance to call the base method on.
   * @param {...any} params - Parameters to pass to the base method.
   * @returns {any} The result of the base method.
   */
  baseFunc(obj, ...params) {
    const funcName = Oloo._getCallingFunctionName();
    if (!funcName) {
      throw new Error("Unable to determine calling function name.");
    }
  },

  /**
   * @description Calls the base method (parent method in prototype chain) for the given object.
   * pass function by ref or name.
   * 
   * @param {Object} obj - The object instance to call the base method on.
   * @param {...any} params - Parameters to pass to the base method.
   * @returns {any} The result of the base method.
   */
  base(obj, funcName, ...params) {
    funcName = typeof funcName === 'function' ? funcName.name.replace(/(bound|\s)/g,'') : funcName;

    let currentObjectInstance = Oloo.objectMap.get(obj);
    if(currentObjectInstance && currentObjectInstance[funcName]) {
      // Keeps track of how far down the inheritance tree we are for a give function. Start from scratch if we called a different function.
      obj = Object.getPrototypeOf(currentObjectInstance[funcName]) || obj;
    }

    // Start with the first base object that has the function. This will also ignore the first base objects func if we are calling the method without base since that will be the function we are calling this from.
    let parent = Oloo._getBaseFunction(obj, funcName);

    // We ignore the first function since that is where the base originally got called from.
    if(!currentObjectInstance || (currentObjectInstance && !currentObjectInstance[funcName])) {
      parent = Object.getPrototypeOf(parent);
      parent = Oloo._getBaseFunction(parent, funcName);
    }

    if(currentObjectInstance) {
      currentObjectInstance[funcName] = parent;
    }
    else {
      currentObjectInstance = { obj, [funcName]: parent };
      Oloo.objectMap.set(obj, currentObjectInstance);
    }

    const ret = parent[funcName].bind(currentObjectInstance.obj)(...params);

    if(currentObjectInstance.obj) {
      Oloo.objectMap.delete(currentObjectInstance.obj);
    }

    return ret;
  },
  
  /**
  * @description Get the first base object that has a function.
  */
  _getBaseFunction(parent, funcName) {
    while(!parent.hasOwnProperty(funcName)) {
      // Get parent that has func to call.
      parent = Object.getPrototypeOf(parent);

      if(process.env.NODE_ENV !== 'production') {
        if(!parent) {
          console.error(`No base function ${funcName} was found.`);
          return null;
        }
      }
    }

    return parent;
  },

  /**
   * @description Infers the calling function's name by parsing the stack trace.
   * This is used to avoid passing the function name manually to the `base` method.
   * 
   * @returns {string|null} The name of the calling function, or null if it cannot be determined.
   */
  _getCallingFunctionName() {
    // Capture the current call stack (modern browsers support this)
    const error = new Error();
    const stack = error.stack;

    // Assuming stack trace in form "at functionName (file.js:line:column)"
    const match = stack?.split("\n")[3]?.match(/at .*?\.(\w+) /);
    return match ? match[1] : null;
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