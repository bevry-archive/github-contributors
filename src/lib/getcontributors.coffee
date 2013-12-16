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
{TaskGroup} = require('taskgroup')

# Getter
class Getter
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
		@reposGetter = require('getrepos').create(opts)

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
		return @contributorsMap[contributorData.id]

	# Clone Contributor
	cloneContributor: (contributor) ->
		# Clone
		contributorData = extendr.safeDeepExtendPlainObjects({
			name: null
			email: null
			url: null
			username: null
			text: null
			repos: null
		}, contributor)

		# Return
		return contributorData

	# Prepare a contributor by setting and determing some defaults
	# contributor = {}
	# return {}
	prepareContributor: (contributor) ->
		# Log
		@log 'debug', 'Preparing the contributor:', contributor

		# Prepare
		contributorData = @cloneContributor(contributor)

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
	prepareContributorFinale: (contributor) ->
		# Log
		@log 'debug', 'Preparing the contributor for the final time:', contributor

		# Prepare
		contributorData = @cloneContributor(contributor)

		# Fallbacks
		contributorData.name or= contributorData.username
		contributorData.url  or= "https://github.com/#{contributorData.username}"

		# Create text property
		contributorData.text = []
		contributorData.text.push(contributorData.name)
		contributorData.text.push("<#{contributorData.email}>")  if contributorData.email
		contributorData.text.push("(#{contributorData.url})")
		contributorData.text = contributorData.text.join(' ') or null

		# Create markdown property
		contributorData.markdown = "[#{contributorData.name}](#{contributorData.url})"
		contributorData.markdown += " <#{contributorData.email}>"  if contributorData.email

		# Return
		return contributorData

	# Get the contributors
	# return []
	getContributors: (contributors) ->
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

		# Allow the user to pass in their own contributors array or object
		if contributors? is false
			contributors = @contributorsMap
		else
			# Remove duplicates from array
			if typeChecker.isArray(contributors) is true
				exists = {}
				contributors = contributors.filter (contributor) ->
					exists[contributor.username] ?= 0
					++exists[contributor.username]
					return exists[contributor.username] is 1

		# Convert objects to arrays
		if typeChecker.isPlainObject(contributors) is true
			contributors = Object.keys(contributors).map((key) => contributors[key])

		# Prepare the contributors that were passed in
		contributors = contributors.map(@prepareContributorFinale.bind(@)).sort(contributorsComparator)

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

		# Fetch
		@reposGetter.fetchReposFromUsers users, (err,repos) ->
			# Check
			return next(err, [])  if err

			# Filter out forks, return just their names
			repoNames =
				for repo in repos
					continue  if repo.fork is true
					repo.full_name

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
		result = []
		tasks = new TaskGroup().setConfig(concurrency:0).once 'complete', (err) ->
			return next(err, [])  if err
			result = me.getContributors(result)
			return next(null, result)

		# Add the contributors for each repo
		repos.forEach (repo) ->
			tasks.addTask (complete) ->
				me.fetchContributorsFromPackage repo, (err,contributors=[]) ->
					return complete(err)  if err
					result.push(contributors...)
					return complete()

			tasks.addTask (complete) ->
				me.fetchContributorsFromRepo repo, (err,contributors=[]) ->
					return complete(err)  if err
					result.push(contributors...)
					return complete()

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
		feedOptions =
			url: "http://raw.github.com/#{repo}/master/package.json"
			format: 'json'

		# Read the repo's package file
		@feedr.readFeed feedOptions, (err,packageData) ->
			# Ignore if error'd or no result
			return next(null, [])  if err or !packageData?

			# Prepare
			addedContributors = []

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
				addedContributor = me.addContributor(contributorData)
				addedContributors.push(addedContributor)  if addedContributor

			# Return contributors
			return next(null, addedContributors)

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
		feedOptions =
			url: "https://api.github.com/repos/#{repo}/contributors?per_page=100&client_id=#{@config.githubClientId}&client_secret=#{@config.githubClientSecret}"
			parse: 'json'

		# Fetch the repo's contributors
		@feedr.readFeed feedOptions, (err,data) ->
			# Check
			return next(err, [])  if err
			return next(null, [])  unless data?.length

			# Prepare
			addedContributors = []

			# Extract the correct data from the contributors
			for contributor in data
				# Prepare
				contributorData =
					url: contributor.html_url
					username: contributor.login
					repos: {}

				# Add repo
				contributorData.repos[repo] = "https://github.com/#{repo}"

				# Add contributor
				addedContributor = me.addContributor(contributorData)
				addedContributors.push(addedContributor)  if addedContributor

			# Return contributors
			return next(null, addedContributors)

		# Chain
		@

# Export
module.exports =
	create: (args...) ->
		return new Getter(args...)
