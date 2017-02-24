'use strict'

// Import
const typeChecker = require('typechecker')
const extendr = require('extendr')
const {TaskGroup} = require('taskgroup')

/**
Compare two contributor entities for sorting in an array
@param {Contributor} a
@param {Contributor} b
@return {number} either 0, -1, or 1
@access private
*/
function contributorsComparator (a, b) {
	const A = a.name.toLowerCase()
	const B = b.name.toLowerCase()
	if ( A === B ) {
		return 0
	}
	else if ( A < B ) {
		return -1
	}
	else {
		return 1
	}
}

/**
Clone a contributor to prevent reference issues
@param {Contributor} contributor
@return {Contributor}
@access private
*/
function cloneContributor (contributor) {
	// Clone
	const contributorData = extendr.deepDefaults({
		name: null,
		email: null,
		url: null,
		username: null,
		text: null,
		repos: null
	}, contributor)

	// Return
	return contributorData
}

/**
Get Contributors Class

A class as it contains a config object, as well as a contributorsMap object.

Configuration details can be found in the constructor definition.

Configuration is also forwarded onto https://github.com/bevry/feedr which we use for fetching data.

The contributorsMap object is used to prevent duplicates when fetching contributor data, and to merge data together in case some was missing somewhere but provided elsewhere.

Contributors have the following properties:

- name
- email
- url
- username
- text (a string formatted like `NAME <EMAIL> (URL)` for use in package.json fields)
- repos

@constructor
@class Getter
@access public
*/
class Getter {
	/**
	Creates and returns new instance of the current class.
	@param {...*} args - The arguments to be forwarded along to the constructor.
	@return {Object} The new instance.
	@static
	@access public
	*/
	static create (...args) {
		return new this(...args)
	}

	/**
	Forward the arguments onto the configured logger if it exists.
	@param {Object} [opts]
	@param {Function} [opts.log] - defaults to `null`, can be a function that receives the arguments: `logLevel`, `...args`
	@param {string} [opts.githubClientId] - defaults to the environment variable `GITHUB_CLIENT_ID` or `null`
	@param {string} [opts.githubClientSecret] - defaults to environment variable `GITHUB_CLIENT_SECRET` or `null`
	@access public
	*/
	constructor (opts = {}) {
		// Prepare
		this.config = {
			githubClientId: process.env.GITHUB_CLIENT_ID || null,
			githubClientSecret: process.env.GITHUB_CLIENT_SECRET || null
		}
		this.contributorsMap = {}
		this.reposGetter = require('getrepos').create(opts)

		// Extend configuration
		extendr.extend(this.config, opts)

		// Feedr
		this.feedr = require('feedr').create(this.config)

		// Chain
		return this
	}

	/**
	Forward the arguments onto the configured logger if it exists.
	@param {...*} args
	@chainable
	@returns {this}
	@access private
	*/
	log (...args) {
		if ( this.config.log ) {
			this.config.log(...args)
		}
		return this
	}

	/**
	Add a contributor to the internal listing and finish preparing it
	@param {Contributor} [contributor]
	@returns {Contributor}
	@access private
	*/
	addContributor (contributor) {
		// Log
		this.log('debug', 'Adding the contributor:', contributor)

		// Prepare
		const contributorData = this.prepareContributor(contributor)

		// We need a username
		if ( !contributorData.username ) {
			return null
		}

		// Find existing contributor
		contributorData.id = contributorData.username.toLowerCase()
		const existingContributorData = this.contributorsMap[contributorData.id] = (
			this.contributorsMap[contributorData.id] || {}
		)

		// Merge contributorData into the existingContributorData
		extendr.deepDefaults(existingContributorData, contributorData)

		// Update references in database
		this.contributorsMap[contributorData.id] = existingContributorData
		this.contributorsMap[contributorData.id].repos = (
			this.contributorsMap[contributorData.id].repos || {}
		)

		// Return
		this.log('debug', 'Added the contributor:', contributor)
		return this.contributorsMap[contributorData.id]
	}

	/**
	Prepare a contributor by setting and determing some defaults
	@param {Contributor} [contributor]
	@returns {Contributor}
	@access private
	*/
	prepareContributor (contributor) {
		// Log
		this.log('debug', 'Preparing the contributor:', contributor)

		// Prepare
		const contributorData = cloneContributor(contributor)

		// Extract username
		if ( contributorData.url && contributorData.username == null ) {
			const usernameMatch = (/^.+?github.com\/([^/]+).*$/).exec(contributorData.url)
			if ( usernameMatch ) {
				contributorData.username = (usernameMatch[1] || '').trim() || null
			}
		}

		// Return
		return contributorData
	}

	/**
	Prepare a contributor for return to the user, assume we have no more data, so determine the rest
	@param {Contributor} [contributor]
	@returns {Contributor}
	@access private
	*/
	prepareContributorFinale (contributor) {
		// Log
		this.log('debug', 'Preparing the contributor for the final time:', contributor)

		// Prepare
		const contributorData = cloneContributor(contributor)

		// Fallbacks
		contributorData.name = (
			contributorData.name || contributorData.username
		)
		contributorData.url = (
			contributorData.url || `https://github.com/${contributorData.username}`
		)

		// Create text property
		contributorData.text = []
		contributorData.text.push(contributorData.name)
		if ( contributorData.email ) {
			contributorData.text.push(`<${contributorData.email}>`)
		}
		contributorData.text.push(`(${contributorData.url})`)
		contributorData.text = contributorData.text.join(' ') || null

		// Create markdown property
		contributorData.markdown = `[${contributorData.name}](${contributorData.url})`
		if ( contributorData.email ) {
			contributorData.markdown += ` <${contributorData.email}>`
		}

		// Return
		return contributorData
	}

	/**
	Prepare a contributor for return to the user, assume we have no more data, so determine the rest
	@param {Array} [contributors] - array of {Contributor}
	@returns {Array} - array of {Contributor}
	@access private
	*/
	getContributors (contributors) {
		// Log
		this.log('debug', 'Get contributors')

		// Allow the user to pass in their own contributors array or object
		if ( contributors == null ) {
			contributors = this.contributorsMap
		}

		// Remove duplicates from array
		else if ( typeChecker.isArray(contributors) ) {
			const exists = {}
			contributors = contributors.filter(function (contributor) {
				if ( exists[contributor.username] == null ) {
					exists[contributor.username] = 0
				}
				++exists[contributor.username]
				return exists[contributor.username] === 1
			})
		}

		// Convert objects to arrays
		console.log('257:', Object.keys(contributors))
		if ( typeChecker.isPlainObject(contributors) ) {
			contributors = Object.keys(contributors).map((key) => contributors[key])
		}

		// Prepare the contributors that were passed in
		this.log('debug', `Preparing the ${contributors.length} contributors for the final time`)
		contributors = contributors.map(this.prepareContributorFinale.bind(this)).sort(contributorsComparator)

		// Return
		return contributors
	}

	/**
	Fetch Contributors from Usernames
	@param {Array} [users] - array of {string} user names, such as `['bevry', 'balupton']`
	@param {Function} [next] - completion callback, accepts the arguments:
	@param {Error} [next.error] - if the procedure failed, this is the error instance, otherwise `null`
	@param {Array} [next.result] - if the procedure succedeed, this is the array of contributors
	@chainable
	@returns {this}
	@access public
	*/
	fetchContributorsFromUsers (users, next) {
		// Log
		this.log('debug', 'Get contributors from users:', users)

		// Fetch
		this.reposGetter.fetchReposFromUsers(users, (err, repos) => {
			// Check
			if ( err ) {
				return next(err, [])
			}

			// Filter out forks, return just their names
			const repoNames = repos
				.filter((repo) => repo.fork !== true)
				.map((repo) => repo.full_name)

			// Fetch the contributors for the repos
			return this.fetchContributorsFromRepos(repoNames, next)
		})

		// Chain
		return this
	}

	/**
	Fetch Contributors from Repository Names
	@param {Array} [repos] - array of {string} repository names, such as `['bevry/getcontributors', 'bevry/getrepos']`
	@param {Function} [next] - completion callback, accepts the arguments:
	@param {Error} [next.error] - if the procedure failed, this is the error instance, otherwise `null`
	@param {Array} [next.result] - if the procedure succedeed, this is the array of contributors
	@chainable
	@returns {this}
	@access public
	*/
	fetchContributorsFromRepos (repos, next) {
		// Log
		this.log('debug', 'Get contributors from repos:', repos)

		// Prepare
		const me = this
		const result = []
		const tasks = TaskGroup.create({concurrency: 0}).done(function (err) {
			if ( err ) {
				return next(err, [])
			}
			return next(null, me.getContributors(result))
		})

		// Add the contributors for each repo
		repos.forEach(function (repo) {
			tasks.addTask(function (complete) {
				me.fetchContributorsFromPackage(repo, function (err, contributors = []) {
					if ( err ) {
						return complete(err)
					}
					result.push(...contributors)
					return complete()
				})
			})

			tasks.addTask(function (complete) {
				me.fetchContributorsFromRepo(repo, function (err, contributors = []) {
					if ( err ) {
						return complete(err)
					}
					result.push(...contributors)
					return complete()
				})
			})
		})

		// Start
		tasks.run()

		// Chain
		return this
	}

	/**
	Fetch Contributors from a Repository's package.json file if it has one
	@param {string} [repo] - repository name such as `'bevry/getcontributors'`
	@param {Function} [next] - completion callback, accepts the arguments:
	@param {Error} [next.error] - if the procedure failed, this is the error instance, otherwise `null`
	@param {Array} [next.result] - if the procedure succedeed, this is the array of contributors
	@chainable
	@returns {this}
	@access public
	*/
	fetchContributorsFromPackage (repo, next) {
		// Log
		this.log('debug', 'Get contributors from package:', repo)

		// Prepare
		const me = this
		const feedOptions = {
			url: `http://raw.github.com/${repo}/master/package.json`,
			parse: 'json'
		}

		// Read the repo's package file
		this.feedr.readFeed(feedOptions, function (err, packageData) {
			// Ignore if error'd or no result
			if ( err || !packageData ) {
				return next(err, [])
			}

			// Prepare
			const addedContributors = []

			// Add each of the contributors
			const everyone = (packageData.contributors || []).concat(packageData.maintainers || [])
			everyone.forEach(function (contributor) {
				// Prepare
				let contributorData = {}

				// Extract
				if ( typeChecker.isString(contributor) ) {
					const contributorMatch = (/^([^<(]+)\s*(?:<(.+?)>)?\s*(?:\((.+?)\))?$/).exec(contributor)
					if ( !contributorMatch ) {
						return
					}
					contributorData = {
						name: (contributorMatch[1] || '').trim() || null,
						email: (contributorMatch[2] || '').trim() || null,
						url: (contributorMatch[3] || '').trim() || null,
						repos: {}
					}
				}

				else if ( typeChecker.isPlainObject(contributor) ) {
					contributorData = {
						name: contributor.name || null,
						email: contributor.email || null,
						url: contributor.web || null,
						username: contributor.username || null,
						repos: {}
					}
				}

				else {
					return
				}

				// Add repo
				contributorData.repos[repo] = `https://github.com/${repo}`

				// Add contributor
				const addedContributor = me.addContributor(contributorData)
				if ( addedContributor ) {
					addedContributors.push(addedContributor)
				}
			})

			// Return contributors
			return next(null, addedContributors)
		})

		// Chain
		return this
	}

	/**
	Fetch Contributors from a Repository's GitHub Contributor API
	@param {string} [repo] - repository name such as `'bevry/getcontributors'`
	@param {Function} [next] - completion callback, accepts the arguments:
	@param {Error} [next.error] - if the procedure failed, this is the error instance, otherwise `null`
	@param {Array} [next.result] - if the procedure succedeed, this is the array of contributors
	@chainable
	@returns {this}
	@access public
	*/
	fetchContributorsFromRepo (repo, next) {
		// Log
		this.log('debug', 'Get contributors from repo:', repo)

		// Prepare
		const me = this
		const feedOptions = {
			url: `https://api.github.com/repos/${repo}/contributors?per_page=100&client_id=${this.config.githubClientId}&client_secret=${this.config.githubClientSecret}`,
			parse: 'json'
		}

		// Fetch the repo's contributors
		this.feedr.readFeed(feedOptions, function (err, responseData) {
			// Check
			if ( err ) {
				return next(err, [])
			}
			if ( !responseData || !responseData.length ) {
				return next(null, [])
			}

			// Prepare
			const addedContributors = []

			// Check
			if ( !responseData.forEach ) {
				const error = new Error('response data was not an array: ' + require('util').inspect(responseData, {colors: true, depth: 2}))
				return next(error)
			}

			// Extract the correct data from the contributors
			responseData.forEach(function (contributor) {
				// Prepare
				const contributorData = {
					url: contributor.html_url,
					username: contributor.login,
					repos: {}
				}

				// Add repo
				contributorData.repos[repo] = `https://github.com/${repo}`

				// Add contributor
				const addedContributor = me.addContributor(contributorData)
				if ( addedContributor ) {
					addedContributors.push(addedContributor)
				}
			})

			// Return contributors
			return next(null, addedContributors)
		})

		// Chain
		return this
	}
}

// Export
module.exports = Getter
