"use strict";

const NS = '@lumjs/proxy-model';

module.exports =
{
  NS,
  VAL: 'validate',
  SET: 'set',
  GET: 'get',

  PROXY_HOOKS:
  [
    'defineProperty','get','getOwnPropertyDescriptor',
    'getPrototypeOf','has', 'isExtensible', 'ownKeys', 
    'preventExtensions', 'set', 'setPrototypeOf',
  ],
}
