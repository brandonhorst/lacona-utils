import _ from 'lodash'

function groupPlaceholders (result) {
  return _.chain(result.words)
    .filter(item => item.placeholder || item.text)
    .map(item => item.placeholder ? '\uFFFC' : `\uFFF9${item.text}\uFFFA${item.argument}\uFFFB`)
    .join('')
    .value()
}

function mapPlaceholderGroups (resultGroup) {
  const placeholders = _.chain(resultGroup)
    .map(result => {
      return _.chain(result.words)
        .filter('placeholder')
        .map('text')
        .value()
    })
    .thru(descriptorLists => _.zip(...descriptorLists))
    .map(x => _.unique(x))
    .map(x => _.filter(x))
    .value()

  const result = _.clone(_.first(resultGroup))

  _.chain(result.words)
    .filter('placeholder')
    .forEach((item, index) => {
      item.placeholderTexts = placeholders[index]
      // item.descriptors = [placeholders[index]]
    })
    .value()

  return result
}

export function combinePlaceholders(results, limit = 100) {
  return _.chain(results)
    .groupBy(groupPlaceholders)
    .map(mapPlaceholderGroups)
    .sortBy(option => -option.score)
    .take(limit)
    .value()
}
