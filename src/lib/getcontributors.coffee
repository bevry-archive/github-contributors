# Fetch contributors for all repos of the users
# Opts =
# - users: array of the users to fetch contributors for
# - github_client_id
# - github_client_secret
# - log: log function
# Next =
# - err: error or null
# - contributors: an array of contributor objects
# Contributor =
# - name
# - email
# - url
# - username
# - text
# - repos

# Import
typeChecker = require('typechecker')
extendr = require('extendr')
eachr = require('eachr')
{extractOpts} = require('extract-opts')
{TaskGroup} = require('taskgroup')

# GetContributors
class GetContributors
	# Contributors
	# Object listing of all the contributors, indexed by their lowercase username
	contributorsMap: null  # {}

	# Config
	config: null  # {}

	# Constructor
	# Create a new contributors instance
	# opts={githubClientId, githubClientSecret} - also forwarded onto feedr
	constructor: (opts={}) ->
		# Prepare
		@config = {}
		@contributorsMap = {}

		# Extend configuration
		extendr.extend(@config, opts)

		# Try env for github credentials
		@config.githubClientId ?= process.env.GITHUB_CLIENT_ID or null
		@config.githubClientSecret ?= process.env.GITHUB_CLIENT_SECRET or null

		# Feedr
		@feedr = new (require('feedr').Feedr)(@config)

		# Chain
		@

	# Log
	log: (args...) ->
		@config.log?(args...)
		@

	# Add a contributor to the internal listing and finish preparing it
	# contributor = {}
	# return {}
	addContributor: (contributor) ->
		# Log
		@log 'debug', 'Adding the contributor:', contributor

		# Prepare
		contributorData = @prepareContributor(contributor)

		# We need a username
		return null  unless contributorData.username

		# Find existing contributor
		contributorData.id = contributorData.username.toLowerCase()
		existingContributorData = @contributorsMap[contributorData.id] ?= {}

		# Merge contributorData into the existingContributorData
		extendr.safeDeepExtendPlainObjects(existingContributorData, contributorData)

		# Update references in database
		@contributorsMap[contributorData.id] = existingContributorData
		@contributorsMap[contributorData.id].repos ?= {}

		# Return
		return existingContributorData

	# Prepare a contributor by setting and determing some defaults
	# contributor = {}
	# return {}
	prepareContributor: (contributor) ->
		# Log
		@log 'debug', 'Preparing the contributor:', contributor

		# Prepare
		contributorData = extendr.safeDeepExtendPlainObjects({
			name: null
			email: null
			url: null
			username: null
			text: null
			repos: null
		}, contributor)

		# Extract username
		if contributorData.url and contributorData.username is null
			usernameMatch = /^.+?github.com\/([^\/]+).*$/.exec(contributorData.url)
			if usernameMatch
				contributorData.username = (usernameMatch[1] or '').trim() or null

		# Return
		return contributorData

	# Prepare a contributor for return to the user, assume we have no more data, so determine the rest
	# contributorData = {}
	# return {}
	prepareContributorFinale: (contributorData) ->
		# Log
		@log 'debug', 'Preparing the contributor for the final time:', contributorData

		# Fallbacks
		contributorData.name or= contributorData.username
		contributorData.url  or= "https://github.com/#{contributorData.username}"

		# Create text property
		contributorData.text = []
		contributorData.text.push(contributorData.name)
		contributorData.text.push("<#{contributorData.email}>")  if contributorData.email
		contributorData.text.push("(#{contributorData.url})")
		contributorData.text = contributorData.text.join(' ') or null

		# Return
		return contributorData

	# Get the contributors
	# return []
	getContributors: ->
		# Log
		@log 'debug', 'Get contributors'

		# Prepare
		contributorsComparator = (a,b) ->
			A = a.name.toLowerCase()
			B = b.name.toLowerCase()
			if A is B
				0
			else if A < B
				-1
			else
				1

		# Fetch prepared contributors and sort them
		contributors = Object.keys(@contributorsMap).map((key) => @contributorsMap[key]).map(@prepareContributorFinale.bind(@)).sort(contributorsComparator)

		# Return
		return contributors

	# Fetch Contributors From Users
	# repos=["bevry"]
	# next(err)
	# return @
	fetchContributorsFromUsers: (users,next) ->
		# Log
		@log 'debug', 'Get contributors from users:', users

		# Prepare
		me = @
		userRepoFeeds = users.map (user) => "https://api.github.com/users/#{user}/repos?per_page=100&client_id=#{@config.githubClientId}&client_secret=#{@config.githubClientSecret}"

		# Read the user's repository feeds
		@feedr.readFeeds userRepoFeeds, (err,repoFeedResult) ->
			# Check
			return next(err)  if err

			# Read the user's repository feed's results
			# then read each of the repos in the result
			repoNames = []
			eachr repoFeedResult, (repos) ->
				# Check
				return next(new Error(repos.message))  if repos.message

				# Filter out forks, return just their names
				eachr repos, (repoData) ->
					return  if repoData.fork is true
					repoNames.push(repoData.full_name)

			# Fetch the contributors for the repos
			return me.fetchContributorsFromRepos(repoNames, next)

		# Chain
		@

	# Fetch Contributors From Repos
	# repos=["bevry/getcontributors"]
	# next(err)
	# return @
	fetchContributorsFromRepos: (repos,next) ->
		# Log
		@log 'debug', 'Get contributors from repos:', repos

		# Prepare
		me = @
		tasks = new TaskGroup().setConfig(concurrency:0).once('complete', next)

		# Add the contributors for each repo
		eachr repos, (repo) ->
			tasks.addTask (complete) ->
				me.fetchContributorsFromPackage(repo, complete)

			tasks.addTask (complete) ->
				me.fetchContributorsFromRepo(repo, complete)

		# Start
		tasks.run()

		# Chain
		@

	# Fetch Contributors from Package
	# repo="bevry/getcontributors"
	# next(err)
	# return @
	fetchContributorsFromPackage: (repo,next) ->
		# Log
		@log 'debug', 'Get contributors from package:', repo

		# Prepare
		me = @
		packageUrl = "http://raw.github.com/#{repo}/master/package.json"

		# Read the repo's package file
		@feedr.readFeed packageUrl, (err,packageData) ->
			# Ignore if error'd or no result
			return next()  if err or !packageData?

			# Add each of the contributors
			for contributor in [].concat(packageData.contributors or []).concat(packageData.maintainers or [])
				# Prepare
				contributorData = {}

				# Extract
				if typeChecker.isString(contributor)
					contributorMatch = /^([^<(]+)\s*(?:<(.+?)>)?\s*(?:\((.+?)\))?$/.exec(contributor)
					continue  unless contributorMatch
					contributorData =
						name: (contributorMatch[1] or '').trim() or null
						email: (contributorMatch[2] or '').trim() or null
						url: (contributorMatch[3] or '').trim() or null
						repos: {}

				else if typeChecker.isPlainObject(contributor)
					contributorData =
						name: contributor.name or null
						email: contributor.email or null
						url: contributor.web or null
						username: contributor.username or null
						repos: {}

				else
					continue

				# Add repo
				contributorData.repos[repo] = "https://github.com/#{repo}"

				# Add contributor
				me.addContributor(contributorData)

			# Return contributors
			return next()

		# Chain
		@

	# Fetch Contributors from Repository
	# repo="bevry/getcontributors"
	# next(err)
	# return @
	fetchContributorsFromRepo: (repo,next) ->
		# Log
		@log 'debug', 'Get contributors from repo:', repo

		# Prepare
		me = @
		contributorsUrl = "https://api.github.com/repos/#{repo}/contributors?per_page=100&client_id=#{@config.githubClientId}&client_secret=#{@config.githubClientSecret}"

		# Fetch the repo's contributors
		@feedr.readFeed contributorsUrl, (err,result=[]) ->
			# Ignore if error'd or no result
			return next()  if err or !(result?.length)

			# Extract the correct data from the contributors
			for contributor in result
				# Prepare
				contributorData =
					url: contributor.html_url
					username: contributor.login
					repos: {}

				# Add repo
				contributorData.repos[repo] = "https://github.com/#{repo}"

				# Add contributor
				me.addContributor(contributorData)

			# Return contributors
			return next()

		# Chain
		@

# Export
module.exports =
	create: (args...) ->
		return new GetContributors(args...)
