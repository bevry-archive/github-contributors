/* eslint no-console:0 */
'use strict'

// Import
const {getType} = require('typechecker')
const {equal, errorEqual} = require('assert-helpers')
const joe = require('joe')

// Test
joe.suite('getcontributors', function (suite, test) {
	let getter = null

	// Create our contributors instance
	test('create', function () {
		getter = require('../').create({
			// log: console.log
		})
	})

	// Fetch all the contributors on these github
	suite('repo', function (suite, test) {
		test('fetch', function (done) {
			getter.fetchContributorsFromRepos(['bevry/getcontributors'], function (err) {
				errorEqual(err, null)
				return done()
			})
		})

		test('combined result', function () {
			const result = getter.getContributors()
			equal(getType(result), 'array', 'result is array')
			equal(result.length > 0, true, 'to have a length more than 0')
		})
	})

	// Fetch all the contributors on these github users/organisations
	suite('users', function (suite, test) {
		test('fetch', function (done) {
			getter.fetchContributorsFromUsers(['docpad'], function (err) {
				errorEqual(err, null)
				return done()
			})
		})

		test('combined result', function () {
			const result = getter.getContributors()
			equal(getType(result), 'array', 'result is array')
			equal(result.length > 0, true, 'to have a length more than 0')
		})
	})
})
