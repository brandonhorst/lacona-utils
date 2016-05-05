import _ from 'lodash'

function groupPlaceholders (output) {
  return _.chain(output.words)
    .filter(item => item.placeholder || item.text)
    .map(item => item.placeholder ? '\uFFFC' : `\uFFF9${item.text}\uFFFA${item.argument}\uFFFB`)
    .join('')
    .value()
}

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
    .map(x => _.uniq(x))
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

function flatMapQualifiers (outputGroup) {
  // PERF
  // if there is only one item, then we don't need qualifiers
  if (outputGroup.length === 1) {
    return [_.assign({}, outputGroup[0], {qualifiers: []})]
  }

  const allQualifiers = _.map(outputGroup, 'qualifiers')
  const commonQualifiers = _.intersection(...allQualifiers)

  // PERF
  // if there are no commonQualifiers, no need to do all this work
  if (commonQualifiers.length) {
    return _.map(outputGroup, output => {
      const qualifiers = _.difference(output.qualifiers, commonQualifiers)
      return _.assign({}, output, {qualifiers})
    })
  } else {
    return outputGroup
  }
}

export function combinePlaceholders (outputs, limit = 100) {
  return _.chain(outputs)
    .groupBy(groupPlaceholdersAndQualifiers)
    .map(mapPlaceholderGroups)
    .groupBy(groupPlaceholders)
    .flatMap(flatMapQualifiers)
    .sortBy(option => -option.score)
    .take(limit)
    .value()
}


// First - group by placeholders
