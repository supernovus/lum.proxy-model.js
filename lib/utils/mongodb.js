"use strict";

const core = require('@lumjs/core');
const {S,isObj} = core.types;

function oidStr(v)
{
  if (typeof v === S)
  { // It's already a string
    return v;
  }

  if (isObj(v) && typeof v.$oid === S)
  { // A MongoDB ObjectID in serialized JSON format.
    return v.$oid;
  }
  
  // Try forcing it to be a string.
  return v.toString();
}

function oidObj(v)
{
  if (isObj(v) && typeof v.$oid === S)
  { // It's already an oid object
    return v;
  }

  return {$oid: v.toString()};
}

function toDate(v)
{
  if (v instanceof Date)
  { // It's already a date
    return v;
  }

  if (isObj(v))
  {
    if (typeof v.$date === S)
    { // Relaxed schema
      return Date(v.$date);
    }
    if (isObj(v.$date) && typeof v.$date.$numberLong === S)
    { // Canonical schema
      const ms = parseInt(v.$date.$numberLong);
      return new Date(ms);
    }
  }

  // Pass it to the Date constructor and cross your fingers
  return new Date(v);
}

function fromDate(v)
{
  if (!(val instanceof Date))
  { // Force it into a Date
    val = new Date(val);
  }

  const ms = val.getTime();
  return {$date:{$numberLong: ms.toString()}};
}

module.exports =
{
  oidStr, oidObj, toDate, fromDate,
}
