import _ from 'lodash'

// Declarative garbage sorry
function nullAdditions (addition, additions, wordsLength) {
  let lastWord = 0
  const newAdditions = []
  _.forEach(additions, addition => {
    if (addition.start > lastWord) {
      newAdditions.push({start: lastWord, end: addition.start})
      lastWord = addition.end
    }
    newAdditions.push(addition)
  })
  if (wordsLength > lastWord) {
    newAdditions.push({start: lastWord, end: wordsLength})
  }

  return newAdditions
}

// function groupPlaceholders (output) {
//   const groupString = _.chain(output.argumentsWithNulls)
//     .map(({start, end, value}) => {
//       const joinedWords = _.chain(output.words)
//         .slice(start, end)
//         .map(word => word.placeholder ? '\uFFFC' : word.text)
//         .join('')
//         .value()
//       return `\uFFF9${joinedWords}\uFFFA${value || ''}\uFFFB`
//     })
//     .join('')
//     .value()
//   return groupString
// }

function groupAdditions (addition, output) {
  const groupString = _.chain(output[addition])
    .map(({start, end, value}) => {
      const joinedWords = _.chain(output.words)
        .slice(start, end)
        .map(word => word.placeholder ? '\uFFFC' : word.text)
        .join('')
        .value()
      return `\uFFF9${joinedWords}\uFFFA${value || ''}\uFFFB`
    })
    .join('')
    .value()

  return groupString
}

function groupQualifiers (output) {
  const groupString = _.chain(output.words)
    .map(word => word.placeholder ? '\uFFFC' : word.text)
    .map((text, i) => {
      const qualifiersEndingHere = _.chain(output.qualifiers)
        .filter(qualifier => qualifier.end === i + 1)
        .map('value')
        .value()
      return `${text}\uFFF9${qualifiersEndingHere.join('\uFFFA')}\uFFFB`
    })
    .join('')
    .value()

  return groupString
}

function compareQualifiers (a, b) {
  return a.value === b.value && a.end === b.end
}

function removeUnnecessaryQualifiers (outputGroup) {
  const commonQualifiers = _.chain(outputGroup)
    .map('qualifiers')
    .thru(qualifierGroup => _.intersectionWith(...qualifierGroup, compareQualifiers))
    .value()

  _.forEach(outputGroup, output => {
    output.qualifiers = _.differenceWith(output.qualifiers, commonQualifiers, compareQualifiers)
  })
}

function mapQualifiers (argumentGroup) {
  // if there is only one in the argumentGroup, no need to worry about quals
  if (argumentGroup.length === 1) {
    argumentGroup[0].qualifiers = []
  }
  return _.chain(argumentGroup)
    .groupBy(output => groupQualifiers(output))
    .map(mapPlaceholderGroups)
    .tap(removeUnnecessaryQualifiers)
    .value()
}

function mapPlaceholderGroups (qualifierGroup) {
  // these have the same qualifiers - no need to even specify
  if (qualifierGroup.length > 1) {
    qualifierGroup[0].qualifiers = []
  }

  const placeholders = _.chain(qualifierGroup)
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

  const output = qualifierGroup[0]

  _.chain(output.words)
    .filter('placeholder')
    .forEach((item, index) => {
      item.placeholderTexts = placeholders[index]
      delete item.text
      // item.descriptors = [placeholders[index]]
    })
    .value()

  return output
}

// function flatMapQualifiers (outputGroup) {
//   // PERF
//   // if there is only one item, then we don't need qualifiers
//   if (outputGroup.length === 1) {
//     return [_.assign({}, outputGroup[0], {qualifiers: []})]
//   }

//   const allQualifiers = _.map(outputGroup, 'qualifiers')
//   const commonQualifiers = _.intersection(...allQualifiers)

//   // PERF
//   // if there are no commonQualifiers, no need to do all this work
//   if (commonQualifiers.length) {
//     return _.map(outputGroup, output => {
//       const qualifiers = _.difference(output.qualifiers, commonQualifiers)
//       return _.assign({}, output, {qualifiers})
//     })
//   } else {
//     return outputGroup
//   }
// }

function doTopLevelAdditions (addition, output) {
  let lastWord = 0
  const topLevelAdditions = _.filter(output[addition], ({end}) => {
    if (end > lastWord) {
      lastWord = end
      return true
    }
    return false
  })

  const nullTopLevelAdditions = nullAdditions(addition, topLevelAdditions, output.words.length)

  output[addition] = nullTopLevelAdditions
}

function doRemovePlaceholderArguments (output) {
  const newArguments = _.filter(output.arguments, ({start, end}) => {
    if (start === end - 1 && output.words[start].placeholder) {
      return false
    }
    return true
  })

  output.arguments = newArguments
}

function doRemoveNullAdditions (addition, output) {
  const newAdditions = _.filter(output[addition], 'value')
  output[addition] = newAdditions
}

/*
If two options have different text, leave them be

Remove all but the top level arguments
Remove any arguments that only contains a single placeholder
Group by text/argument, combining placeholders
Group those groups by qualifiers
Anything that gets grouped in this group should have qualifier checking done
If they have the same text, but different arguments, leave them be

Remove all but top-level qualifiers
If they have the same text and arguments but different qualifiers, take the first qualifier that is distinct for each segment
call() Vicky(Li) Mobile()
call() Vicky Mobile(Home)
call() Vicky Mobile(Cell)
If they have the same text and arguments, and placeholders with different names, combine them
*/




/*

Remove all but top level arguments and qualifiers
Remove arguments that only contain a single placeholder
Group all outputs that have the same text, qualifiers, and arguments
Combine placeholders of those outputs, otherwise take the first one (they are identical for our purposes)
Group all outputs that have the same text and arguments


same text, same arguments, different qualifiers


*/

export function combinePlaceholders (outputs, limit = 100) {
  return _.chain(outputs)
    .map(_.clone)
    .forEach(output => doTopLevelAdditions('arguments', output))
    .forEach(doRemovePlaceholderArguments)
    .groupBy(output => groupAdditions('arguments', output))
    .flatMap(mapQualifiers)
    // .groupBy(groupPlaceholders)
    // .flatMap(flatMapQualifiers)
    .forEach(output => doRemoveNullAdditions('arguments', output))
    .forEach(output => doRemoveNullAdditions('qualifiers', output))
    .sortBy(option => -option.score)
    .take(limit)
    .value()
}

