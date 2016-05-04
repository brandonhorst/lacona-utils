import _ from 'lodash'

function groupPlaceholdersAndQualifiers (output) {
  return _.chain(output.words)
    .filter(item => item.placeholder || item.text)
    .map(item => item.placeholder ? '\uFFFC' : `\uFFF9${item.text}\uFFFA${item.argument}\uFFFB`)
    .join('')
    .concat(`\uFFF9${output.qualifiers.join('\uFFFA')}\uFFFB`)
    .value()
}

function mapPlaceholderGroups (outputGroup) {
  const placeholders = _.chain(outputGroup)
    .map(output => {
      return _.chain(output.words)
        .filter('placeholder')
        .map('text')
        .value()
    })
    .thru(descriptorLists => _.zip(...descriptorLists))
    .map(x => _.unique(x))
    .map(x => _.filter(x))
    .value()

  const output = _.clone(_.first(outputGroup))

  _.chain(output.words)
    .filter('placeholder')
    .forEach((item, index) => {
      item.placeholderTexts = placeholders[index]
      // item.descriptors = [placeholders[index]]
    })
    .value()

  return output
}

export function combinePlaceholders (outputs, limit = 100) {
  return _.chain(outputs)
    .groupBy(groupPlaceholdersAndQualifiers)
    .map(mapPlaceholderGroups)
    .sortBy(option => -option.score)
    .take(limit)
    .value()
}


// First - group by placeholders
