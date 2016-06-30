import _ from 'lodash'

function nullArguments (args, wordsLength) {
  let lastWord = 0
  const newAdditions = []
  _.forEach(args, arg => {
    if (arg.start > lastWord) {
      newAdditions.push({start: lastWord, end: arg.start})
    }
    newAdditions.push(arg)
    lastWord = arg.end
  })
  if (wordsLength > lastWord) {
    newAdditions.push({start: lastWord, end: wordsLength})
  }

  return newAdditions
}

function groupArguments (output) {
  const groupString = _.chain(output.arguments)
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

  return _.map(outputGroup, output => {
    const qualifiers = _.differenceWith(output.qualifiers, commonQualifiers, compareQualifiers)
    return _.assign({}, output, {qualifiers})
  })
}

function mapQualifiers (argumentGroup) {
  // if there is only one in the argumentGroup, no need to worry about quals
  if (argumentGroup.length === 1) {
    argumentGroup = [_.assign({}, argumentGroup[0], {qualifiers: []})]
  }

  return _.chain(argumentGroup)
    .groupBy(output => groupQualifiers(output))
    .map(mapPlaceholderGroups)
    .thru(removeUnnecessaryQualifiers)
    .value()
}

function mapPlaceholderGroups (qualifierGroup) {
  // these have the same qualifiers - no need to even specify
  // if (qualifierGroup.length > 1) {
  //   qualifierGroup[0].qualifiers = []
  // }

  const placeholders = _.chain(qualifierGroup)
    .map(output => {
      return _.chain(output.words)
        .map(word => word.placeholder ? word.label : undefined)
        .value()
    })
    .thru(descriptorLists => _.zip(...descriptorLists))
    .map(x => _.uniq(x))
    .map(x => _.filter(x))
    .value()

  const output = qualifierGroup[0]

  const newWords = _.map(output.words, (word, index) => {
    if (word.placeholder) {
      // no way to delete w/o cloning
      const newWord = _.clone(word)
      newWord.placeholderTexts = placeholders[index]
      delete newWord.label
      return newWord
    } else {
      return word
    }
  })

  return _.assign({}, output, {words: newWords})
}

function doTopLevelArguments (output) {
  // If any words don't have a placeholder label, use its argument instead
  const newWords = _.map(output.words, (word, index) => {
    if (word.placeholder && !word.label) {
      const firstArgument = _.find(output.arguments, argument => {
        return argument.start === index && argument.end === index + 1
      })
      if (firstArgument) {
        return _.assign({}, word, {label: firstArgument.value})
      }
    }
    return word
  })

  let lastWord = 0
  const topLevelArguments = _.filter(output.arguments, ({start, end}) => {
    if (end > lastWord) {
      if (start === end - 1 && output.words[start].placeholder) {
        return false
      }
      lastWord = end
      return true
    }
    return false
  })

  const nullTopLevels = nullArguments(topLevelArguments, output.words.length)


  return _.assign({}, output, {arguments: nullTopLevels, words: newWords})
}

export function combinePlaceholders (outputs, limit = 100) {
  return _.chain(outputs)
    .map(doTopLevelArguments)
    .groupBy(groupArguments)
    .flatMap(mapQualifiers)
    .sortBy(option => -option.score)
    .take(limit)
    .value()
}

