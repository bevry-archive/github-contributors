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
module.exports = (opts,next) ->
	# Import
	feedr = new (require('feedr').Feedr)(opts)
	balUtil = require('bal-util')
	eachr = require('eachr')
	extendr = require('extendr')
	{TaskGroup} = require('taskgroup')
	typeChecker = require('typechecker')

	# Prepare
	[opts,next] = balUtil.extractOptsAndCallback(opts,next)
	contributors = {}
	addContributor = (repo,contributor) ->
		# Prepare
		contributorData = extendr.extend({
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

		# We need a username
		return  unless contributorData.username

		# Find existing contributor
		contributorData.id = contributorData.username.toLowerCase()
		existingContributorData = contributors[contributorData.id] ?= {}

		# Merge contributorData into the existingContributorData
		extendr.safeShallowExtendPlainObjects(existingContributorData, contributorData)

		# Update references in database
		contributors[contributorData.id] = existingContributorData
		(contributors[contributorData.id].repos ?= {})[repo.name] = repo.html_url

	# Log
	opts.log?('info', "Fetching Contributors...")

	# Tasks
	tasks = new TaskGroup().setConfig(concurrency:0).once 'complete', (err) ->
		# Check
		return next(err)  if err

		# Merge and ensure certain properties
		ensurer = (contributorData) ->
			# Fallbacks
			contributorData.name or= contributorData.username
			contributorData.url or= "https://github.com/#{contributorData.username}"

			# Create text property
			contributorData.text = []
			contributorData.text.push(contributorData.name)
			contributorData.text.push("<#{contributorData.email}>")  if contributorData.email
			contributorData.text.push("(#{contributorData.url})")
			contributorData.text = contributorData.text.join(' ') or null

			# Return
			return contributorData

		# Sort our contributors
		comparator = (a,b) ->
			A = a.name.toLowerCase()
			B = b.name.toLowerCase()
			if A is B
				0
			else if A < B
				-1
			else
				1

		# Handle
		contributorsSortedArray = (contributorData  for own key,contributorData of contributors).map(ensurer).sort(comparator)
		contributorsSortedObject = (contributors[contributorData.id]  for contributorData in contributorsSortedArray)

		# Log
		opts.log?('info', "Fetched Contributors")

		# Done
		return next(null, contributorsSortedObject)

	# Repositories
	userRepoFeeds = []
	for user in opts.users
		userRepoFeed = "https://api.github.com/users/#{user}/repos?per_page=100&client_id=#{opts.github_client_id}&client_secret=#{opts.github_client_secret}"
		userRepoFeeds.push(userRepoFeed)

	# Read the user's repository feeds
	feedr.readFeeds userRepoFeeds, (err,repoFeedResult) ->
		# Read the user's repository feed's results
		# then read each of the repos in the result
		eachr repoFeedResult, (repos) ->  if repos.message then opts.log?('warn',repos.message) else eachr repos, (repo) ->
			# Ignore the repo if it is a fork
			return  if repo.fork is true

			# Fetch the repo's contributors
			contributorsUrl = "https://api.github.com/repos/#{repo.full_name}/contributors?per_page=100&client_id=#{opts.github_client_id}&client_secret=#{opts.github_client_secret}"
			tasks.addTask (complete) ->  feedr.readFeed contributorsUrl, (err,contributors) ->
				# Check
				return complete()  if err or !contributors  # ignore

				# Add eahc of the contributors
				for contributor in contributors or []
					# Prepare
					contributorData =
						url: contributor.html_url
						username: contributor.login

					# Apply Contributor
					addContributor(repo, contributorData)

				# Finished adding contributors for the contributors request
				complete()


			# Read the repo's package file
			packageUrl = repo.html_url.replace('//github.com','//raw.github.com')+'/master/package.json'
			tasks.addTask (complete) ->  feedr.readFeed packageUrl, (err,packageData) ->
				# Check
				return complete()  if err or !packageData  # ignore

				# Add each of the contributors
				for contributor in packageData.contributors or []
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
					else if typeChecker.isPlainObject(contributor)
						contributorData =
							name: contributor.name or null
							email: contributor.email or null
							url: contributor.web or null
							username: contributor.username or null
					else
						continue

					# Apply Contributor
					addContributor(repo, contributorData)

				# Finished adding contributors for the package.json request
				complete()

		# Fire
		tasks.run()

	# Done
	return @
