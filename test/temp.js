"use strict";

const lib = require('../lib/index.js');

const d1 = 
{
  _id: {$oid:"1"},
  name: 'Tim',
  birthday: {$date:{$numberLong: "298857600000"}},
  level: 99,
  admin: true,
}

const MT = lib.types.MongoDB;
const YMS = (365 * 24 * 60 * 60 * 1000);

class User extends lib.Model
{
  get typeConverters()
  {
    return (
    {
      _id: MT.oid,
      birthday: MT.date,
    });
  }

  get readonlyProps()
  {
    return ['age'];
  }

  get propAliases()
  {
    return {id: '_id'};
  }

  get age()
  {
    const now = new Date().getTime();
    const bd  = this.proxy.birthday.getTime();
    const diff = now - bd;
    return (diff / YMS);
  }
}

const u1 = new User(d1);

module.exports =
{
  lib, User, d1, u1,
}
