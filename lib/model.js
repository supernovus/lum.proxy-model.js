"use strict";

const core = require('@lumjs/core');
const {def,B,F,isProperty,isObj,isIterable} = core.types;
const 
{
  EVENT_OPTS, V1_META_PROPS: META_PROPS, PROXY_HOOKS, VAL, SET, GET,
} = require('./values');
const cp = Object.assign;

/**
 * A data model class using Proxy as its foundation.
 * 
 * The ProxyModel object is used as the `target` object
 * in the Proxy instance, and is always the _secondary_ source
 * for proxied properties (after the model data object).
 *
 * This documentation will list fundamental properties that
 * will always exist in the ProxyModel instance object,
 * as well as optional properties and methods that may be
 * added to model-specific sub-classes to provide extra features.
 * 
 * @prop {object} data - The model data object;
 * always used as the primary source for proxied properties.
 * 
 * @prop {LumEventRegistry} events - Event registry instance.
 * 
 * @prop {object} hooks - Used as the Proxy _handler_; 
 * contains applicable Proxy hook functions.
 * 
 * Any of the hooks with a corresponding method in the
 * ProxyModel class/sub-class will have wrapped hook functions.
 * 
 * It _will always_ contain hooks for `get, set, has, ownKeys,
 * getOwnPropertyDescriptor, deleteProperty`.
 * 
 * It _may also_ include hooks for `apply, construct, defineProperty, 
 * getPrototypeOf, isExtensible, preventExtensions, setPrototypeOf`.
 * 
 * @prop {function} on - Shortcut to `this.events.listen()` method.
 * 
 * @prop {object} options - Options passed to the constructor;
 * may also include default options supplied in `defaultOptions`.
 * 
 * @prop {?object} parent - A parent object (if applicable).
 * 
 * @prop {Proxy} proxy - The Proxy instance object wrapping this.
 * 
 * @prop {object} defaultOptions - (Optional) A way to supply explicit
 * default values for any supported options.
 * 
 * Due to when this property is read (at the very beginning of the
 * constructor method), it may **ONLY** be applied as a _getter property_
 * in a model-specific sub-class. Which is how all of the optional
 * properties are intended to be implemented, but it's explicitly the
 * only way that this particular property works at all!
 * 
 * @prop {Iterable} extraProps - (Optional) A list of additional
 * property names (strings and/or Symbols only) that will be
 * included in the default `ownKeys()` hook method.
 * 
 * @prop {object} metaOptions - (Optional) TODO: document this.
 * 
 * @prop {object} propAliases - (Optional) A map of alias names to
 * actual property names. Supported by the built-in hooks.
 * 
 * @prop {Iterable} readonlyProps - (Optional) A list of properties
 * that should not allow their values to be changed by the `set` hook.
 * 
 * @prop {object} typeConverters - (Optional) A map of property names
 * to TypeConverter objects with `get(v)` and `set(v)` methods to
 * convert between underlying model data property values and JS API values.
 * 
 * See the `@lumjs/proxy-model.types.MongoDB` collection for some simple
 * examples of TypeConverter objects.
 * 
 * @prop {function} setupModel - (Optional) A method/function that
 * can be used to set up the underlying ProxyModel instance object, 
 * which in addition to being `this` (assuming it's not a bound closure),
 * will be passed as the sole argument.
 * 
 * @prop {function} setupProxy - (Optional) A method/function that
 * can be used to set up the real Proxy instance object.
 * The ProxyModel object will be `this` (assuming it's not a bound closure),
 * and the Proxy object will be passed as the sole argument.
 * 
 * @prop {*} dataSelf - (Special) See the `selfMask` constructor option
 * for details on this special property. Unless you're doing something
 * wrong, this property should never be assigned.
 * 
 */
class ProxyModel 
{
  /**
   * Create a Proxy instance wrapping a ProxyModel instance.
   * 
   * @param {object} data - The model data.
   * 
   * While any kind of object should work (including `Array`),
   * in typical usage this should be a plain object,
   * like one parsed from JSON or created using `{}` literals.
   * 
   * @param {?object} [parent=null] A parent object (if applicable).
   * 
   * In many cases this would be an object representing
   * a database row (which in turn would have a parent
   * object representing the database table).
   * 
   * @param {object} [options] Extra options for advanced features.
   * 
   * A list of standard options will be listed below.
   * Any meta-options added via the `metaOptions` property will also
   * be supported here, as well as additional model-specific options.
   * 
   * If a `get defaultOptions()` getter exists in a model sub-class, 
   * it may return an object specifying default values for some options.
   * Therefore the default values in this documentation only apply if
   * not overridden.
   * 
   * The `this.options` property will be a *copy* of this options object,
   * along with any of the default values that may have been applied and
   * not overridden by explicit constructor options.
   * 
   * @param {boolean} [options.dataDescriptor=false] The `data` object
   * is actually a _descriptor_ to be used to assign `this.data`.
   * 
   * If you don't know what that means or why you might want to use it,
   * leave this feature disabled, as you'll likely never need it.
   * 
   * @param {boolean} [options.deleteTest=true] Should the default 
   * `deleteProperty` hook test if the property was removed from
   * the data object?
   * 
   * @param {object} [options.events] Options for LumEvents.Registry;
   * 
   * The defaults for this class will only create the `events` property,
   * and the `on()` shortcut method. The `emit()` shortcut method that
   * is typically added is disabled by default as it's not usually
   * needed to be directly accessible and that's one less property.
   * 
   * @param {boolean} [options.ownAllNames=false] Should the default
   * `ownKeys` hook include non-enumerable string-keyed properties from
   * the model data?
   * 
   * If `false` (the default), only enumerable string-keyed properties 
   * from the model data will be included.
   * 
   * @param {boolean} [options.ownSymbols=false] Should the default
   * `ownKeys` hook include Symbol-keyed properties from the model data?
   * 
   * The Symbol keys will be added after the string keys.
   * 
   * @param {boolean} [options.readonlyFail=false] Should attempts to
   * set read-only properties result in the `set` hook returning `false`
   * instead of `true` (which in turn will usually result in a `TypeError`
   * being thrown).
   * 
   * This is only used if `options.readonlyReturn` was not specified,
   * or was not a valid _boolean_ value.
   * 
   * @param {?boolean} [options.readonlyReturn=null] If this is set,
   * it will be used as the value returned by the `set()` hook when an
   * attempt to set a value on a read-only property is made.
   * 
   * If this is NOT set, then the _inverse_ of `options.readonlyFail`
   * will be used instead.
   * 
   * @param {(string|symbol)} [options.self="self"] The property name for
   * a self-referencial pointer to the ProxyModel instance itself.
   * 
   * The main reason this option exists is so if you know in your data modal 
   * there is a `data.self` property, you can override the property key to 
   * something else that won't be in conflict.
   * 
   * @param {boolean} [options.selfMask=false] Should we allow the
   * data object to mask the self-referencial property key?
   * 
   * If `false` (the default) and a property with the `options.self`
   * key is found in the `data`: an error message will be output to the
   * global JS console, the property value will be moved from the data 
   * object into a `dataSelf` property of the ProxyModel object,
   * and the default `set` hook will add the `options.self` key to the
   * list of read-only properties.
   * 
   * If set to `true`, no warnings will be issued, the property will not
   * be removed from the data, and the default `set` hook will not add
   * the key to the read-only list.
   */
  constructor(data, parent=null, options)
  {
    options = cp({}, this.defaultOptions, options);

    const selfKey = isProperty(options.self) ? options.self : 'self';
    const self = this;
    const handler = {};
    const exts = options.extensions ?? {};

    core.events.register(this, cp({}, EVENT_OPTS, options.events));

    def(options, 'self', {value: selfKey}); // Now it's non-writable
    def(this, selfKey,   {value: this});    // Reserved key is reserved
    def(this, 'parent',  {value: parent});
    def(this, 'options', {value: options});
    def(this, 'hooks',   {value: handler});
    def(this, 'exts',    {value: exts});
    def(this, 'data',    (options.dataDescriptor ? data : {value: data}));

    if (!options.selfMask && selfKey in this.data)
    {
      console.error(selfKey, 'reserved key found in data object', 
        {self, data, options, arguments});
      this.dataSelf = this.data[selfKey];
      delete this.data[selfKey];
    }

    const mo = this.metaOptions;
    if (isObj(mo))
    { // Allow assigning of select meta properties via options.
      const plist = (typeof mo.list === F)
        ? mo.list(META_PROPS, this, mo) // Custom list function
        : (mo.list ?? META_PROPS);      // Simple props object
      
      const stest = (typeof mo.overwrite === F)
        ? mo.overwrite  // Custom test function
        : (mo.overwrite // Simple true or false
          ? () => true 
          : key => (this[key] === undefined));
      
      for (const key in plist)
      {
        const otest = plist[key];
        if (stest(key) && otest(options[key]))
        {
          def(this, key, options[key]);
          if (mo.remove)
          {
            delete options[key];
          }
        }
      }
    }

    for (const hook of PROXY_HOOKS)
    {
      if (typeof self[hook] === F)
      { // A hook was found, add it to the handler
        handler[hook] = function()
        {
          return self[hook](...arguments);
        }
      }
    }

    if (typeof this.setupModel === F)
    {
      this.setupModel(this);
    }

    const proxy = new Proxy(this, handler);
    def(this, 'proxy', {value: proxy});

    if (typeof this.setupProxy === F)
    {
      this.setupProxy(proxy);
    }

    return proxy;
  }

  /**
   * The method powering the default `get` hook.
   * @emits ProxyModel#get
   * @returns {mixed} Property value, or `undefined` if not found.
   */
  get(o, p, r)
  {
    const cv = this.typeConverters ?? {};
    const al = this.propAliases    ?? {};
    const ev = this.events;
    const ot = [{o,p,r}];

    if (isProperty(al[p]))
    { // An alias definition was set
      p = al[p];
    }

    let v = (p in this.exts) 
      ? this.exts[p] 
      : ((p in this.data) 
        ? this.data[p] 
        : Reflect.get(...arguments));

    ot.push({p,v});

    if (isObj(cv[p]) && typeof cv[p].get === F)
    { // A converter was set
      v = cv[p].get.call(this, v);
      ot.push({v});
    }
    
    const os = {key: p, val: v, from:ot, model: this};

    ev.emit(GET, os);

    return os.val;
  }

  /**
   * Getter that will check `this.options.readonlyReturn`;
   * if that not set, uses `!this.options.readonlyFail` instead.
   */
  get readonlyReturn()
  {
    if (typeof this.options.readonlyReturn === B)
    {
      return this.options.readonlyReturn;
    }
    else
    {
      return !this.options.readonlyFail;
    }
  }

  /**
   * The method powering the default `set` hook.
   * @emits ProxyModel#set
   * @returns {boolean} Was the value able to be set?
   */
  set(o, p, v, r)
  {
    const cv = this.typeConverters ?? {};
    const al = this.propAliases    ?? {};
    const ro = new Set(this.readonlyProps);
    const ev = this.events;
    const rr = this.readonlyReturn;
    const ot = [{o,p,v,r}];

    if (!this.options.selfMask)
    { // Ensure the self-reference key is read-only
      ro.add(this.options.self);
    }

    let rv = true;

    if (isProperty(al[p]))
    { // An alias definition was set
      p = al[p];
    }

    if (isObj(cv[p]) && typeof cv[p].set === F)
    { // A converter was set
      v = cv[p].set.call(this, v);
    }

    ot.push({p,v});

    const os = {key: p, val: v, done: false, from: ot, model: this};

    ev.emit(VAL, os);
    if (!os.done)
    {
      if (ro.has(os.key))
      {
        os.error = 'readonly property';
        console.error(os);
        rv = rr;
      }
      else
      {
        this.data[os.key] = os.val;
        os.done = true;
      }
    }
    ev.emit(SET, os);

    return rv;
  }

  /**
   * The method powering the default `has` hook.
   * @emits ProxyModel#has
   * @returns {boolean} Was the value able to be set?
   */
  has(o, p)
  {
    const al = this.propAliases ?? {};
    const ot = [{o,p}];
    const ev = this.events;

    if (isProperty(al[p]))
    {
      p = al[p];
    }

    ot.push({p});

    const os = {key: p, from: ot};
    os.val = ((p in this.data) || Reflect.has(o,p));
    this.events.emit('has', os);
    return os.val;
  }

  /**
   * The method powering the default `ownKeys` hook.
   * @emits ProxyModel#ownKeys
   * @returns {Array} Array of _unique_ keys from all sources.
   */
  ownKeys(o)
  {
    const opt = this.options;
    const keys = opt.ownAllNames // 
      ? Object.getOwnPropertyNames(this.data)
      : Object.keys(this.data);

    if (opt.ownSymbols)
    { // Include Symbols from the data
      const syms = Object.getOwnPropertySymbols(this.data);
      keys.push(...syms);
    }

    const extra = this.extraProps;
    if (isIterable(extra))
    {
      keys.push(...extra);
    }

    const os = {from: [{o}], keys};
    this.events.emit('ownKeys', os)
    return Array.from(new Set(os.keys));
  }

  /**
   * The method powering the default `getOwnPropertyDescriptor` hook.
   * @emits ProxyModel#getOwnPropertyDescriptor
   * @returns {(object|undefined)} Descriptor; or undefined if not found.
   */
  getOwnPropertyDescriptor(o, p)
  {
    const al = this.propAliases ?? {};
    const from = [{o,p}];

    if (isProperty(al[p]))
    {
      p = al[p];
    }

    from.push({p});

    const os = {key: p, from};
    os.val = (p in this.data)
      ? Object.getOwnPropertyDescriptor(this.data, p)
      : Reflect.getOwnPropertyDescriptor(o, p);

    this.events.emit('getOwnPropertyDescriptor', os);
    return os.val;
  }

  /**
   * The method powering the default `deleteProperty` hook.
   * @emits ProxyModel#deleteProperty
   * @returns {boolean} Was the value able to be deleted?
   */
  deleteProperty(o, p)
  {
    const al = this.propAliases ?? {};
    const from = [{o,p}];
    const test = this.options.deleteTest ?? true;

    if (isProperty(al[p]))
    {
      p = al[p];
    }

    from.push({p});

    const os = {key: p, from, ok: null};
    this.events.emit('deleteProperty', os);

    if (typeof os.ok !== B)
    { // Now actually delete the property.
      delete this.data[p];
      os.ok = test ? (this.data[p] === undefined) : true;
    }

    return os.ok;
  }
  
}

module.exports = ProxyModel;
