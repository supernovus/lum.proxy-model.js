"use strict";

const core = require('@lumjs/core');
const {F,isObj,isIterable} = core.types;
const NS = '@lumjs/proxy-model';

module.exports = Object.freeze(
{
  NS,
  VAL: 'validate',
  ALL: 'all',
  SET: 'set',
  GET: 'get',
  DEF: 'processDefault',

  PROXY_HOOKS: Object.freeze(
  [
    'apply', 'construct', 'defineProperty', 'deleteProperty', 'get', 
    'getOwnPropertyDescriptor', 'getPrototypeOf', 'has', 'isExtensible', 
    'ownKeys', 'preventExtensions', 'set', 'setPrototypeOf',
  ]),

  V1_META_PROPS:
  {
    typeConverters: isObj,
    propAliases:    isObj,
    readonlyProps:  isIterable,
    extraProps:     isIterable,
  },

  V2_META_PROPS:
  {
    process:    isObj,
    aliases:    isObj,
    extraProps: isIterable,
  },

  EVENT_OPTS:
  {
    extend:
    {
      emit: null,
    },
  },

});
