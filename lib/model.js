"use strict";

const core = require('@lumjs/core');
const {def,F,isProperty,isObj} = core.types;
const 
{
  PROXY_HOOKS,VAL,SET,GET,NS,
} = require('./values');

const EOPTS =
{
  extend:
  {
    emit: null,
  },
}

/**
 * A data model class using Proxy as its foundation
 */
class ProxyModel 
{
  constructor(data, parent=null, options={})
  {
    const self = this;
    const handler = {};

    core.events.register(this, EOPTS);

    def(this, 'self',    {value: this});
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

    const proxy = new Proxy(this, handler);
    def(this, 'proxy', {value: proxy});

    return proxy;
  }

  get typeConverters()
  {
    return {};
  }

  get propAliases()
  {
    return {};
  }

  get readonlyProps()
  {
    return [];
  }

  get extraProps()
  {
    return [];
  }

  get(o, p, r)
  {
    const cv = this.typeConverters;
    const al = this.propAliases;
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

  set(o, p, v, r)
  {
    const cv = this.typeConverters;
    const al = this.propAliases;
    const ev = this.events;
    const ro = this.readonlyProps;
    const ot = [{o,p,v,r}];

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
      if (ro.includes(os.key))
      {
        os.error = 'readonly property';
        console.error(os);
      }
      else
      {
        this.data[os.key] = os.val;
        os.done = true;
      }
    }
    ev.emit(SET, os);

    return true;
  }

  has(o, p)
  {
    const al = this.propAliases;

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
    keys.push(...this.extraProps);
    return Array.from(new Set(keys));
  }

  getOwnPropertyDescriptor(o, p)
  {
    const al = this.propAliases;

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
    const al = this.propAliases;

    if (isProperty(al[p]))
    {
      p = al[p];
    }

    delete this.data[p];
    return (this.data[p] === undefined);
  }
  
}

module.exports = ProxyModel;
