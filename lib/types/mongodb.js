"use strict";

const u = require('../utils/mongodb');

module.exports =
{
  date:
  {
    get: u.toDate,
    set: u.fromDate,
  },
  oid:
  {
    get: u.oidStr,
    set: u.oidObj,
  },
}
