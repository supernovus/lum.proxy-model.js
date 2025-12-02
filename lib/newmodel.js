'use strict';

const cp = Object.assign;
const core = require('@lumjs/core');
const {B,F,isProperty,isObj,isIterable} = core.types;
const {df} = core.obj;
const V = require('./values');
const {PROXY_HOOKS, V2_META_PROPS: META_PROPS} = V;

/**
 * A data model using a Proxy object as its foundation (take 2).
 * 
 * This version of the proxy model class is designed by be a lot less
 * convoluted than the original implementation. As such it leaves a lot
 * of functionality to be implemented by processors/converters.
 * 
 * It is NOT designed to be backwards compatible with the old version!
 * 
 * TODO: finish this!
 */
class NewProxyModel
{
  /**
   * Build a Proxy object wrapping a NewProxyModel instance.
   * 
   * @param {object} options - Named arguments.
   * 
   * Despite the name, at least one of `options.data` or `options.sources`
   * MUST be specified. Otherwise an error will be thrown!
   * 
   * @param {object} [options.data] The model data as a single object.
   * 
   * @param {object[]} [options.sources] An array of model data source objects.
   * 
   * If specified, this takes precedence over `options.data`.
   * 
   * When looking for  properties, the first object a defined value is found
   * in will be used as the source of that property.
   * 
   * @returns {Proxy} A Proxy object with the model instance as its target.
   */
  constructor(options)
  {
    options = cp({}, this.defaultOptions, options);

    const hooks   = cp({}, options.hooks);
    const selfKey = isProperty(options.self) ? options.self : 'self';
    const sources = options.sources ?? options.data;

    if (!isObj(sources))
    {
      console.error({options, sources, model: this});
      throw new TypeError("No valid 'data' or 'sources' parameter specified");
    }

    df(options, 'self',    {value: selfKey});
    df(this, selfKey,      {value: this});
    df(this, 'options',    {value: options});
    df(this, 'parent',     {value: options.parent ?? null});
    df(this, 'hooks',      {value: hooks});
    df(this, 'srcCache',   {value: new Map()});
    df(this, 'sources',    
    {
      value: new Set(isIterable(sources) ? sources : [sources])
    });

    this.setupHooks(hooks);
    this.setupModel(options);

    const proxy = new Proxy(this, hooks);
    df(this, 'proxy', {value: proxy});

    if (typeof this.setupProxy === F)
    {
      this.setupProxy(proxy);
    }

    return proxy;
  }

  setupHooks(hooks)
  {
    const self = this;
    for (let hook of PROXY_HOOKS)
    {
      if (typeof self[hook] === F && hooks[hook] === undefined)
      {
        hooks[hook] = function()
        {
          return self[hook](...arguments);
        }
      }
    }
  }

  setupModel(options)
  {
    for (let key in META_PROPS)
    {
      const otest = META_PROPS[key];
      if (this[key] === undefined && otest(options[key]))
      {
        df(this, key, options[key]);
      }
    }
  }


  get(o, p, r)
  {
    const cv = this.process ?? {};
    const al = this.aliases ?? {};
    const args = [o, p, r];

    if (isProperty(al[p]))
    { // An alias definition was set
      p = al[p];
    }

    let v, s;

    if (this.srcCache.has(p))
    {
      s = this.srcCache.get(p);
      v = (s === this ? Reflect.get(o, p, r) : s[p]);
    }
    else
    {
      for (let src of this.sources)
      {
        v = src[p];
        if (v !== undefined)
        { // A value was found (null counts as a value)
          s = src;
          break;
        }
      }

      if (v === undefined)
      {
        v = Reflect.get(o, p, r);
        if (v !== undefined)
        {
          s = this;
        }
      }

      if (isObj(s))
      {
        this.srcCache.set(p, s);
      }
    }

    const os = 
    {
      op: V.GET, 
      args, 
      key: p,
      raw: v, 
      val: v, 
      src: s,
      model: this
    }

    let nv;

    if (isObj(cv[p]))
    {
      let ct = cv[p];
      if (typeof ct.get === F)
      {
        nv = ct.get.call(os, v, os);
      }
      else if (typeof ct.all === F)
      {
        nv = ct.all(os);
      }
    }
    else if (typeof cv[V.DEF] === F)
    {
      nv = cv[V.DEF](os);
    }

    if (nv !== undefined)
    {
      os.val = nv;
    }

    return os.val;
  }

  set(o, p, v, r)
  {
    // TODO
  }

  has(o, p)
  {
    // TODO
  }

  ownKeys(o)
  {
    // TODO
  }

  getOwnPropertyDescriptor(o, p)
  {
    // TODO
  }

  deleteProperty(o, p)
  {
    // TODO
  }

}
