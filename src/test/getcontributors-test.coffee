# Import
{expect} = require('chai')
joe = require('joe')

# Test
joe.suite 'getcontributors', (suite,test) ->
	getter = null

	# Create our contributors instance
	test 'create', ->
		getter = require('../../').create(
			#log: console.log
		)

	# Fetch all the contributors on these github
	suite 'repo', (suite,test) ->
		test 'fetch', (done) ->
			getter.fetchContributorsFromRepos ['bevry/getcontributors'], (err) ->
				expect(err).to.be.null
				return done()

		test 'combined result', ->
			result = getter.getContributors()
			expect(result).to.be.an('array')
			expect(result.length).to.not.equal(0)

	# Fetch all the contributors on these github users/organisations
	suite 'users', (suite,test) ->
		test 'fetch', (done) ->
			getter.fetchContributorsFromUsers ['docpad'], (err) ->
				expect(err).to.be.null
				return done()

		test 'combined result', ->
			result = getter.getContributors()
			expect(result).to.be.an('array')
			expect(result.length).to.not.equal(0)