"use strict";

const core = require('@lumjs/core');
const {def,B,F,isProperty,isObj,isIterable} = core.types;
const 
{
  PROXY_HOOKS, VAL, SET, GET,
} = require('./values');

const EOPTS =
{
  extend:
  {
    emit: null,
  },
}

const META_PROPS =
{
  typeConverters: isObj,
  propAliases:    isObj,
  readonlyProps:  isIterable,
  extraProps:     isIterable,
}

/**
 * A data model class using Proxy as its foundation
 */
class ProxyModel 
{
  constructor(data, parent=null, options={})
  {
    const selfKey = isProperty(options.self) ? options.self : 'self';
    const self = this;
    const handler = {};

    core.events.register(this, EOPTS);

    def(this, selfKey,   {value: this});
    def(this, 'data',    {value: data});
    def(this, 'parent',  {value: parent});
    def(this, 'options', {value: options});
    def(this, 'hooks',   {value: handler});

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

    const mo = this.metaOptions;
    if (isObj(mo))
    { // Allow assigning of select meta properties via options.
      const plist = mo.list ?? META_PROPS;
      const stest = mo.overwrite 
        ? () => true 
        : key => (this[key] === undefined);
      for (const key in plist)
      {
        const otest = plist[key];
        if (stest(key) && otest(options[key]))
        {
          this[key] = options[key];
          if (mo.remove)
          {
            delete options[key];
          }
        }
      }
    }

    const proxy = new Proxy(this, handler);
    def(this, 'proxy', {value: proxy});

    if (typeof this.setupProxy === F)
    {
      this.setupProxy(proxy);
    }

    return proxy;
  }

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

    let v = (p in this.data) ? this.data[p] : Reflect.get(...arguments);

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

  set(o, p, v, r)
  {
    const cv = this.typeConverters ?? {};
    const al = this.propAliases    ?? {};
    const ro = new Set(this.readonlyProps);
    const ev = this.events;
    const rr = this.readonlyReturn;
    const ot = [{o,p,v,r}];

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

  has(o, p)
  {
    const al = this.propAliases ?? {};

    if (isProperty(al[p]))
    {
      p = al[p];
    }

    if (p in this.data) return true;
    return Reflect.has(o, p);
  }

  ownKeys()
  {
    const keys = Object.keys(this.data);
    const extra = this.extraProps;
    if (isIterable(extra))
    {
      keys.push(...extra);
    }
    return Array.from(new Set(keys));
  }

  getOwnPropertyDescriptor(o, p)
  {
    const al = this.propAliases ?? {};

    if (isProperty(al[p]))
    {
      p = al[p];
    }

    if (p in this.data) 
    {
      return Object.getOwnPropertyDescriptor(this.data, p);    
    }

    return Reflect.getOwnPropertyDescriptor(o, p);
  }

  deleteProperty(o, p)
  {
    const al = this.propAliases ?? {};

    if (isProperty(al[p]))
    {
      p = al[p];
    }

    delete this.data[p];
    return (this.data[p] === undefined);
  }
  
}

module.exports = ProxyModel;
