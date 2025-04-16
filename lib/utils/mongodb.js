"use strict";

const MU = require('@lumjs/mongo-utils');

module.exports =
{
  toDate:   MU.date.jsDate, 
  fromDate: MU.date.mongoDate,
  ...MU,
}

