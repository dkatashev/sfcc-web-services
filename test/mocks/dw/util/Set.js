'use strict';

const Collection = require('./Collection');

class DwSet extends Collection {}

DwSet.EMPTY_SET = new DwSet();

module.exports = DwSet;
