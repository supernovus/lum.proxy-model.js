"use strict";

const core = require('@lumjs/core');
const {isObj,isIterable} = core.types;
const NS = '@lumjs/proxy-model';

module.exports = Object.freeze(
{
  NS,
  VAL: 'validate',
  SET: 'set',
  GET: 'get',

  PROXY_HOOKS: Object.freeze(
  [
    'apply', 'construct', 'defineProperty', 'deleteProperty', 'get', 
    'getOwnPropertyDescriptor', 'getPrototypeOf', 'has', 'isExtensible', 
    'ownKeys', 'preventExtensions', 'set', 'setPrototypeOf',
  ]),

  META_PROPS:
  {
    typeConverters: isObj,
    propAliases:    isObj,
    readonlyProps:  isIterable,
    extraProps:     isIterable,
  },
});
