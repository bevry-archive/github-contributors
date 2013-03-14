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
	feedr = new (require('feedr').Feedr)
	balUtil = require('bal-util')

	# Prepare
	[opts,next] = balUtil.extractOptsAndCallback(opts,next)
	contributors = {}

	# Log
	opts.log?('info', "Fetching Contributors...")

	# Tasks
	tasks = new balUtil.Group (err) ->
		# Check
		return next(err)  if err

		# Handle
		contributorsNames = (contributorName  for own contributorName of contributors).sort()
		contributorsSorted = (contributors[contributorName]  for contributorName in contributorsNames)

		# Log
		opts.log?('info', "Fetched Contributors")

		# Done
		return next(null,contributorsSorted)

	# Contributors
	contributorFeeds = []
	for user in opts.users
		contributorFeeds.push "https://api.github.com/users/#{user}/repos?per_page=100&client_id=#{opts.github_client_id}&client_secret=#{opts.github_client_secret}"

	# Read the
	feedr.readFeeds contributorFeeds, (err,feedRepos) ->
		balUtil.each feedRepos, (repos) ->  balUtil.each repos, (repo) ->
			packageUrl = repo.html_url.replace('//github.com','//raw.github.com')+'/master/package.json'
			tasks.push (complete) ->
				feedr.readFeed packageUrl, (err,packageData) ->
					return complete()  if err or !packageData  # ignore
					for contributor in packageData.contributors or []
						# Prepare
						contributorData =
							name: null
							email: null
							url: null
							username: null
							text: null
							repos: null

						# Extract
						if balUtil.isString(contributor)
							contributorMatch = /^([^<(]+)\s*(?:<(.+?)>)?\s*(?:\((.+?)\))?$/.exec(contributor)
							continue  unless contributorMatch
							balUtil.extend contributorData, {
								name: (contributorMatch[1] or '').trim() or null
								email: (contributorMatch[2] or '').trim() or null
								url: (contributorMatch[3] or '').trim() or null
								username: null
							}
						else if balUtil.isPlainObject(contributor)
							balUtil.extend contributorData, {
								name: contributor.name or null
								email: contributor.email or null
								url: contributor.web or null
								username: contributor.username or null
							}
						else
							continue

						# Fallback
						contributorData.name or= contributorData.username or contributorData.email or null

						# Merge
						contributorData.text = []
						contributorData.text.push contributorData.name
						contributorData.text.push "<#{contributorData.email}>"  if contributorData.email
						contributorData.text.push "(#{contributorData.url})"    if contributorData.url
						contributorData.text = contributorData.text.join(' ') or null

						# Skip if no name... this should never happen
						continue  unless contributorData.name

						# Extract username
						if contributorData.url and contributorData.username is null
							usernameMatch = /^.+?github.com\/([^\/]+).*$/.exec(contributorData.url)
							if usernameMatch
								contributorData.username = (usernameMatch[1] or '').trim() or null

						# Create
						contributorId = contributorData.name.toLowerCase()
						contributors[contributorId] ?= {}
						contributors[contributorId].repos ?= {}

						# Extend
						balUtil.safeShallowExtendPlainObjects(contributors[contributorId],contributorData)
						contributors[contributorId].repos[repo.name] = repo.html_url
					complete()

		# Fire
		tasks.async()

	# Done
	return @
