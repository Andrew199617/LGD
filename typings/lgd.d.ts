
declare module '@learngamedevelopment/oloo' {

  /**
  * @description Public facing class.
  * @type {LGDType}
  */
  const LGDType: {
    /**
    * @description Create the global variable that will be used for Oloo.
    */
    setup(): void;

    Oloo: OlooConstructor;
  }

  /**
   * @description Helps with implementing Objects Linked to Other Objects Pattern. No need for this bindings. Also lets you keep your getters and setters as apposed to using Objects.assign.
   * @see https://www.learngamedevelopment.net/blog/oloo(objectslinkingtootherobjects)
   * @class OlooConstructor
   */
  declare interface OlooConstructor {
    /**
     * @description Creates an object that has the specified prototype or that has null prototype.
     * @param o Object to use as a prototype. May be null.
     */
    create(o: object | null): any;

    /**
     * @description Creates an object that has the specified prototype,
     * and that optionally contains specified properties.
     * @param o Object to use as a prototype. May be null
     * @param properties JavaScript object that contains one or more property descriptors.
     */
    create(o: object | null, properties: PropertyDescriptorMap & ThisType<any>): any;

    /**
     * @description This method allows you to have a smaller memory footprint for a much slower initial load.
     * Pair with assignSlow.
     *
     * Typically if you use Object.create you will have prototypes that contain getters down the
     * prototype chain. This will remove those, making it so you only have one Property Descriptor per Accessor.
     *
     * @param {T} obj The object to create instance for.
     */
    createSlow<T>(obj: T): T;

    /**
     * @description As fast as Object.assign and Object.create.
     *
     * Keeps Getters and setters and inheritance of functions.
     * Will also keep inheritance of Getters and Setters.
     * Has same memory efficiency as Object.create/assign.
     *
     * Usage:
     * ``` js
     * const BaseObj = { get var() { return 'ignored': } };
     * const Obj = { get var() { return 'hello'; } };
     * const baseObj = Object.create(BaseObj);
     * const obj = Oloo.assign(baseObj, Obj);
     * // baseObj.var === 'ignored'
     * // obj.var === 'hello'
     * ```
     * @see https://www.learngamedevelopment.net/blog/oloo(objectslinkingtootherobjects)
     * @param {T} baseObj The baseObj object we are inheriting from gets modified in place.
     * @param {M} obj The objects to assign. Obj Inherits from baseObj.
     */
    assign<T, M>(baseObj: T, obj: M): T & M;

    /**
     * @description Same as assign but also carries over Symbols.
     * @param {T} baseObj The baseObj object we are inheriting from gets modified in place.
     * @param {M} obj The objects to assign. Obj Inherits from baseObj.
     */
    assignWithSymbols<T, M>(baseObj: T, obj: M): T & M;

    /**
     * @description Will only keep inheritance of Functions. Getters and Setters will be Overwritten.
     *
     * This method allows you to have a smaller memory footprint for a slower initial load.
     * Do not load more than 100,000 object use regular assign if you need that many.
     *
     * Ideal for classes that don't get created often like Managers, Singletons.
     *
     * @param {T} baseObj The baseObj object we are inheriting from gets modified in place.
     * @param {M} obj The objects to assign. Obj Inherits from baseObj.
     */
    assignSlow<T, M>(baseObj: T, obj: M): T & M;

    /**
     * @description Call the base function of an object.
     * @param {{}} obj The object with the function.
     * @param {function(): R} func The function to call. Pass in using ObjectName.function or this.function.
     * @param {...any[]} params The paramaters to call the function with.
     */
    base<R, P>(obj: {}, func: (...params: P) => R, ...params: P): R;

    /**
     * @description Call the base function of an object.
     * @param {{}} obj The object with the function.
     * @param {string} funcName String name of the function to call. 'functionName'.
     * @param {...any[]} params The paramaters to call the function with.
     */
    base(obj: {}, funcName: string, ...params: any[]);
  }

  export = LGDType;
}


