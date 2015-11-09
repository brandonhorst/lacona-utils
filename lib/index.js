'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.combinePlaceholders = combinePlaceholders;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function groupPlaceholders(result) {
  return _lodash2['default'].chain(result.words).filter(function (item) {
    return item.placeholder || item.text;
  }).map(function (item) {
    return item.placeholder ? '￼' : '￹' + item.text + '￺' + item.argument + '￻';
  }).join('').value();
}

function mapPlaceholderGroups(resultGroup) {
  var placeholders = _lodash2['default'].chain(resultGroup).map(function (result) {
    return _lodash2['default'].chain(result.words).filter('placeholder').map('text').value();
  }).thru(function (descriptorLists) {
    return _lodash2['default'].zip.apply(_lodash2['default'], _toConsumableArray(descriptorLists));
  }).map(function (x) {
    return _lodash2['default'].unique(x);
  }).map(function (x) {
    return _lodash2['default'].filter(x);
  }).value();

  var result = _lodash2['default'].clone(_lodash2['default'].first(resultGroup));

  _lodash2['default'].chain(result.words).filter('placeholder').forEach(function (item, index) {
    item.placeholderTexts = placeholders[index];
    // item.descriptors = [placeholders[index]]
  }).value();

  return result;
}

function combinePlaceholders(results) {
  var limit = arguments.length <= 1 || arguments[1] === undefined ? 100 : arguments[1];

  return _lodash2['default'].chain(results).groupBy(groupPlaceholders).map(mapPlaceholderGroups).sortBy(function (option) {
    return -option.score;
  }).take(limit).value();
}