# Import
{expect} = require('chai')
joe = require('joe')
getContributors = require('../../')

# Test
joe.describe 'getcontributors', (describe,it) ->
	it 'should work as expected', (done) ->
		getContributors(
			users: ['bevry','docpad']
			github_client_id: null
			github_client_secret: null
			log: console.log
			next: (err,contributors) ->
				expect(err).to.be.null
				expect(contributors).to.be.an('array')
				expect(contributors[0]).to.have.keys(['username','name','email','url','text','repos'])
				done()
		)