import {expect} from 'chai'
import {combinePlaceholders} from '../src/index'

describe('combinePlaceholders', () => {
  it('does not combine different inputs', () => {
    const initial = [{
      words: [{text: 'he', input: true}],
      qualifiers: [],
      arguments: [],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'she', input: true}],
      qualifiers: [],
      arguments: [],
      annotations: [],
      score: 1
    }]
    expect(combinePlaceholders(initial)).to.eql([{
      words: [{text: 'he', input: true}],
      qualifiers: [],
      arguments: [{start: 0, end: 1}],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'she', input: true}],
      qualifiers: [],
      arguments: [{start: 0, end: 1}],
      annotations: [],
      score: 1
    }])
  })

  it('combines placeholders', () => {
    const initial = [{
      words: [{label: 'he', placeholder: true}],
      qualifiers: [],
      arguments: [],
      annotations: [],
      score: 1
    }, {
      words: [{label: 'she', placeholder: true}],
      qualifiers: [],
      arguments: [],
      annotations: [],
      score: 1
    }]
    expect(combinePlaceholders(initial)).to.eql([{
      words: [{placeholderTexts: ['he', 'she'], placeholder: true}],
      qualifiers: [],
      arguments: [{start: 0, end: 1}],
      annotations: [],
      score: 1
    }])
  })

  it('combines placeholders that have an argument', () => {
    const initial = [{
      words: [{label: 'he', placeholder: true}],
      qualifiers: [],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }, {
      words: [{label: 'she', placeholder: true}],
      qualifiers: [],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }]
    expect(combinePlaceholders(initial)).to.eql([{
      words: [{placeholderTexts: ['he', 'she'], placeholder: true}],
      qualifiers: [],
      arguments: [{start: 0, end: 1}],
      annotations: [],
      score: 1
    }])
  })

  it('keeps sentences with multiple placeholders', () => {
    const initial = [{
      words: [
        {label: 'he', placeholder: true},
        {text: ' is ', input: false},
        {label: 'she', placeholder: true}
      ],
      qualifiers: [],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }]
    expect(combinePlaceholders(initial)).to.eql([{
      words: [
        {placeholderTexts: ['he'], placeholder: true},
        {text: ' is ', input: false},
        {placeholderTexts: ['she'], placeholder: true}
      ],
      qualifiers: [],
      arguments: [{start: 0, end: 3}],
      annotations: [],
      score: 1
    }])
  })

  it('combines placeholders in arguments', () => {
    const initial = [{
      words: [{label: 'he', placeholder: true}],
      qualifiers: [],
      arguments: [{value: 'he', start: 0, end: 1}],
      annotations: [],
      score: 1
    }, {
      words: [{label: 'she', placeholder: true}],
      qualifiers: [],
      arguments: [{value: 'she', start: 0, end: 1}],
      annotations: [],
      score: 1
    }]
    expect(combinePlaceholders(initial)).to.eql([{
      words: [{placeholderTexts: ['he', 'she'], placeholder: true}],
      qualifiers: [],
      arguments: [{start: 0, end: 1}],
      annotations: [],
      score: 1
    }])
  })

  it('combines text with no arguments', () => {
    const initial = [{
      words: [{text: 'he', input: false}],
      qualifiers: [],
      arguments: [],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'he', input: false}],
      qualifiers: [],
      arguments: [],
      annotations: [],
      score: 1
    }]
    expect(combinePlaceholders(initial)).to.eql([{
      words: [{text: 'he', input: false}],
      qualifiers: [],
      arguments: [{start: 0, end: 1}],
      annotations: [],
      score: 1
    }])
  })

  it('uses the argument if a placeholder label is not provided', () => {
    const initial = [{
      words: [{placeholder: true}],
      qualifiers: [],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }]
    expect(combinePlaceholders(initial)).to.eql([{
      words: [{placeholderTexts: ['pronoun'], placeholder: true}],
      qualifiers: [],
      arguments: [{start: 0, end: 1}],
      annotations: [],
      score: 1
    }])
  })

  it('does not combine text with different qualifiers', () => {
    const initial = [{
      words: [{text: 'he', input: false}],
      qualifiers: [{value: 'that guy', start: 0, end: 1}],
      arguments: [],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'he', input: false}],
      qualifiers: [{value: 'that other guy', start: 0, end: 1}],
      arguments: [],
      annotations: [],
      score: 1
    }]
    expect(combinePlaceholders(initial)).to.eql([{
      words: [{text: 'he', input: false}],
      qualifiers: [{value: 'that guy', start: 0, end: 1}],
      arguments: [{start: 0, end: 1}],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'he', input: false}],
      qualifiers: [{value: 'that other guy', start: 0, end: 1}],
      arguments: [{start: 0, end: 1}],
      annotations: [],
      score: 1
    }])
  })

  it('combines text with the same argument', () => {
    const initial = [{
      words: [{text: 'he', input: false}],
      qualifiers: [],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'he', input: false}],
      qualifiers: [],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }]
    expect(combinePlaceholders(initial)).to.eql([{
      words: [{text: 'he', input: false}],
      qualifiers: [],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }])
  })

  it('combines text with the same qualifiers', () => {
    const initial = [{
      words: [{text: 'he', input: false}],
      qualifiers: [{value: 'man', start: 0, end: 1}],
      arguments: [],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'he', input: false}],
      qualifiers: [],
      qualifiers: [{value: 'man', start: 0, end: 1}],
      arguments: [],
      annotations: [],
      score: 1
    }]
    expect(combinePlaceholders(initial)).to.eql([{
      words: [{text: 'he', input: false}],
      qualifiers: [],
      arguments: [{start: 0, end: 1}],
      annotations: [],
      score: 1
    }])
  })

  it('combines text with the same qualifiers and argumnet', () => {
    const initial = [{
      words: [{text: 'he', input: false}],
      qualifiers: [{value: 'man', start: 0, end: 1}],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'he', input: false}],
      qualifiers: [],
      qualifiers: [{value: 'man', start: 0, end: 1}],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }]
    expect(combinePlaceholders(initial)).to.eql([{
      words: [{text: 'he', input: false}],
      qualifiers: [],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }])
  })

  it('does not combines text with the same argument but different qualifiers', () => {
    const initial = [{
      words: [{text: 'he', input: false}],
      qualifiers: [{value: 'that guy', start: 0, end: 1}],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'he', input: false}],
      qualifiers: [{value: 'that other guy', start: 0, end: 1}],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }]
    expect(combinePlaceholders(initial)).to.eql([{
      words: [{text: 'he', input: false}],
      qualifiers: [{value: 'that guy', start: 0, end: 1}],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'he', input: false}],
      qualifiers: [{value: 'that other guy', start: 0, end: 1}],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }])
  })

  it('removes unnecessary qualifiers', () => {
    const initial = [{
      words: [{text: 'he', input: false}],
      qualifiers: [
        {value: 'man', start: 0, end: 1},
        {value: 'that guy', start: 0, end: 1}
      ],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'he', input: false}],
      qualifiers: [
        {value: 'man', start: 0, end: 1},
        {value: 'that other guy', start: 0, end: 1}
      ],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }]
    expect(combinePlaceholders(initial)).to.eql([{
      words: [{text: 'he', input: false}],
      qualifiers: [{value: 'that guy', start: 0, end: 1}],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'he', input: false}],
      qualifiers: [{value: 'that other guy', start: 0, end: 1}],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }])
  })

  it('uses the first distinct qualifier', () => {
    const initial = [{
      words: [{text: 'he', input: false}],
      qualifiers: [
        {value: 'man', start: 0, end: 1},
        {value: 'that guy', start: 0, end: 1},
        {value: 'so and so', start: 0, end: 1}
      ],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'he', input: false}],
      qualifiers: [
        {value: 'man', start: 0, end: 1},
        {value: 'that other guy', start: 0, end: 1},
        {value: 'your friend', start: 0, end: 1}
      ],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }]
    expect(combinePlaceholders(initial)).to.eql([{
      words: [{text: 'he', input: false}],
      qualifiers: [{value: 'that guy', start: 0, end: 1}],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'he', input: false}],
      qualifiers: [{value: 'that other guy', start: 0, end: 1}],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }])
  })

  it('does not combine text with different arguments', () => {
    const initial = [{
      words: [{text: 'he', input: false}],
      qualifiers: [],
      arguments: [{value: 'pinyin', start: 0, end: 1}],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'he', input: false}],
      qualifiers: [],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }]
    expect(combinePlaceholders(initial)).to.eql([{
      words: [{text: 'he', input: false}],
      qualifiers: [],
      arguments: [{value: 'pinyin', start: 0, end: 1}],
      annotations: [],
      score: 1
    }, {
      words: [{text: 'he', input: false}],
      qualifiers: [],
      arguments: [{value: 'pronoun', start: 0, end: 1}],
      annotations: [],
      score: 1
    }])
  })
})