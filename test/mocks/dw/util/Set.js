'use strict';

const Collection = require('./Collection');

class DwSet extends Collection {}

Set.EMPTY_SET = new DwSet();

module.exports = DwSet;
