# Import
{expect} = require('chai')
joe = require('joe')
getContributors = require('../../')

# Test
joe.describe 'getcontributors', (describe,it) ->
	it 'should work as expected', (done) ->
		getContributors(
			users: ['bevry','docpad']
			github_client_id: process.env.GITHUB_CLIENT_ID or null
			github_client_secret: process.env.GITHUB_CLIENT_SECRET or null
			log: console.log
			next: (err,contributors) ->
				expect(err).to.be.null
				expect(contributors).to.be.an('array')
				expect(contributors.length).to.not.equal(0)
				#expect(contributors[0]).to.have.keys(['id','username','name','email','url','text','repos'])
				done()
		)