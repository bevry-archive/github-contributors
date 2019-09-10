/* eslint no-console:0 */
'use strict'

// Import
const { getType } = require('typechecker')
const { equal, errorEqual } = require('assert-helpers')
const util = require('util')
const kava = require('kava')

// Test
kava.suite('getcontributors', function(suite, test) {
	let getter = null

	// Create our contributors instance
	test('create', function() {
		getter = require('../').create({
			log(...args) {
				console.log(
					args
						.map(arg => util.inspect(arg, { colors: true }))
						.join(' ')
						.replace(
							/(client_id|clientid|key|secret)=[a-z0-9]+/gi,
							'$1=SECRET_REMOVED_BY_FEEDR_CLEAN'
						)
				)
			}
		})
	})

	// Fetch all the contributors on these github
	suite('repo', function(suite, test) {
		test('fetch', function(done) {
			getter.fetchContributorsFromRepos(['bevry/getcontributors'], function(
				err
			) {
				errorEqual(err, null)
				return done()
			})
		})

		test('combined result', function() {
			const result = getter.getContributors()
			equal(getType(result), 'array', 'result is array')
			equal(
				result.length > 0,
				true,
				`length to be more than 0, it was ${result.length}`
			)
		})
	})

	// Fetch all the contributors on these github users/organisations
	suite('users', function(suite, test) {
		test('fetch', function(done) {
			getter.fetchContributorsFromUsers(['browserstate'], function(err) {
				errorEqual(err, null)
				return done()
			})
		})

		test('combined result', function() {
			const result = getter.getContributors()
			equal(getType(result), 'array', 'result is array')
			equal(
				result.length > 0,
				true,
				`length to be more than 0, it was ${result.length}`
			)
		})
	})
})
