# Import
{expect} = require('chai')
joe = require('joe')

# Test
joe.suite 'getcontributors', (suite,test) ->
	getContributors = null

	# Create our contributors instance
	test 'create', ->
		getContributors = require('../../').create(log:console.log);

	# Fetch all the contributors on these github
	suite 'repo', (suite,test) ->
		test 'fetch', (done) ->
			getContributors.fetchContributorsFromRepos ['bevry/getcontributors'], (err) ->
				expect(err).to.be.null
				return done()

		test 'result', ->
			contributors = getContributors.getContributors()
			expect(contributors).to.be.an('array')
			expect(contributors.length).to.not.equal(0)
			console.log contributors

	# Fetch all the contributors on these github users/organisations
	suite 'users', (suite,test) ->
		test 'fetch', (done) ->
			getContributors.fetchContributorsFromUsers ['docpad'], (err) ->
				expect(err).to.be.null
				return done()

		test 'result', ->
			contributors = getContributors.getContributors()
			expect(contributors).to.be.an('array')
			expect(contributors.length).to.not.equal(0)
			console.log contributors
