'use strict'
var conventionalChangelogCoreModule = require('conventional-changelog-core')
var conventionalChangelogCore = typeof conventionalChangelogCoreModule === 'function'
  ? conventionalChangelogCoreModule
  : conventionalChangelogCoreModule.default
var preset = require('../')
var expect = require('chai').expect
var mocha = require('mocha')
var describe = mocha.describe
var it = mocha.it
var gitDummyCommit = require('git-dummy-commit')
var shell = require('shelljs')
var through = require('through2')
var path = require('path')
var betterThanBefore = require('better-than-before')()
var preparing = betterThanBefore.preparing
var writerOpts = require('../writer-opts')

betterThanBefore.setups([
  function () {
    shell.config.silent = true
    shell.rm('-rf', 'tmp')
    shell.mkdir('tmp')
    shell.cd('tmp')
    shell.mkdir('git-templates')
    shell.exec('git init --template=./git-templates')

    gitDummyCommit(['build: first build setup', 'BREAKING CHANGE: New build system.'])
    gitDummyCommit(['ci(travis): add TravisCI pipeline', 'BREAKING CHANGE: Continuously integrated.'])
    gitDummyCommit(['feat: amazing new module', 'BREAKING CHANGE: Not backward compatible.'])
    gitDummyCommit(['fix(compile): avoid a bug', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['perf(ngOptions): make it faster', ' closes #1, #2'])
    gitDummyCommit('revert(ngOptions): bad commit')
    gitDummyCommit('fix(*): oops')
  },
  function () {
    gitDummyCommit(['feat(awesome): addresses the issue brought up in #133'])
  },
  function () {
    gitDummyCommit(['feat(awesome): fix #88'])
  },
  function () {
    gitDummyCommit(['feat(awesome): issue brought up by @bcoe! on Friday'])
  },
  function () {
    gitDummyCommit(['build(npm): edit build script', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['ci(travis): setup travis', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['docs(readme): make it clear', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['style(whitespace): make it easier to read', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['refactor(code): change a lot of code', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['test(*): more tests', 'BREAKING CHANGE: The Change is huge.'])
  },
  function () {
    shell.exec('git tag v1.0.0')
    gitDummyCommit('feat: some more features')
  },
  function () {
    gitDummyCommit(['feat(*): implementing #5 by @dlmr', ' closes #10'])
  },
  function () {
    gitDummyCommit(['fix: use npm@5 (@username)'])
  }
])

describe('angular preset', function () {
  it('should work if there is no semver tag', function (done) {
    preparing(1)

    conventionalChangelogCore({
      config: preset
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk) {
        chunk = chunk.toString()

        expect(chunk).to.include('first build setup')
        expect(chunk).to.include('amazing new module')
        expect(chunk).to.include('make it faster')
        expect(chunk).to.include('New build system.')
        expect(chunk).to.include('Not backward compatible.')
        expect(chunk).to.include('bad commit')
        expect(chunk).to.include('BREAKING CHANGE')

        expect(chunk).to.not.include('***:**')
        expect(chunk).to.not.include(': Not backward compatible.')

        done()
      }))
  })

  it('should work if there is a semver tag', function (done) {
    preparing(6)
    var i = 0

    conventionalChangelogCore({
      config: preset,
      outputUnreleased: true
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk, enc, cb) {
        chunk = chunk.toString()

        expect(chunk).to.include('some more features')
        expect(chunk).to.not.include('BREAKING')

        i++
        cb()
      }, function () {
        expect(i).to.equal(1)
        done()
      }))
  })

})

describe('writer opts', function () {
  it('should expose string templates and partials', function () {
    expect(writerOpts).to.be.an('object')
    expect(writerOpts.mainTemplate).to.be.a('string')
    expect(writerOpts.headerPartial).to.be.a('string')
    expect(writerOpts.commitPartial).to.be.a('string')
    expect(writerOpts.footerPartial).to.be.a('string')
  })
})
