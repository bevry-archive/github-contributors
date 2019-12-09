'use strict'

// Import
const GetRepos = require('getrepos')
const Feedr = require('feedr')
const typeChecker = require('typechecker')
const extendr = require('extendr')
const { TaskGroup } = require('taskgroup')
const githubAuthQueryString = require('githubauthquerystring').fetch()
const ghapi = process.env.GITHUB_API || 'https://api.github.com'

/**
 * @typedef {Object} Config
 * @property {LogCallback} [log]
 */

/**
 * @typedef {Object} Contributor
 * @property {string} [id]
 * @property {string} [name]
 * @property {string} [email]
 * @property {string} [url]
 * @property {string} [username]
 * @property {string} [text] a string formatted like `NAME <EMAIL> (URL)` for use in package.json fields
 * @property {string} [markdown] a string formatted like `[NAME](url) <email>` for using in markdown files
 * @property {Object<string, string>} [repos]
 */

/**
 * @callback LogCallback
 * @param {*} [logLevel]
 * @param {...*} [args]
 */

/**
 * @callback ContributorsCallback
 * @param {Error?} error
 * @param {Contributors} [result]
 */

/**
 * @typedef {Array<Contributor>} Contributors
 * @private
 */

/**
 * @typedef {Object<string, Contributor>} ContributorsMap
 * @private
 */

/**
 * Compare the name param of two objects for sorting in an array
 * @param {Object} a
 * @param {Object} b
 * @return {number} either 0, -1, or 1
 * @private
 */
function nameComparator(a, b) {
	const A = a.name.toLowerCase()
	const B = b.name.toLowerCase()
	if (A === B) {
		return 0
	} else if (A < B) {
		return -1
	} else {
		return 1
	}
}

/**
 * Clone a contributor to prevent reference issues
 * @param {Contributor} contributor
 * @return {Contributor}
 * @private
 */
function cloneContributor(contributor) {
	// Clone
	const contributorData = extendr.deepDefaults(
		{
			name: null,
			email: null,
			url: null,
			username: null,
			text: null,
			repos: null
		},
		contributor
	)

	// Return
	return contributorData
}

/**
 * Get Contributors Class
 * A class as it contains a config object, as well as a `contributorsMap` object.
 * Configuration details can be found in the constructor definition.
 * Configuration is also forwarded onto https://github.com/bevry/feedr which we use for fetching data.
 * The `contributorsMap` object is used to prevent duplicates when fetching contributor data, and to merge data together in case some was missing somewhere but provided elsewhere.
 * @constructor
 * @class Getter
 * @public
 */
class Getter {
	/**
	Creates and returns new instance of the current class.
	 * @param {...*} args - The arguments to be forwarded along to the constructor.
	 * @return {Object} The new instance.
	 * @static
	 * @public
	 */
	static create(...args) {
		return new this(...args)
	}

	/**
	 * Forward the arguments onto the configured logger if it exists.
	 * @param {Config} [opts]
	 * @public
	 */
	constructor(opts = {}) {
		/**
		 * @type {Config}
		 */
		this.config = opts

		/**
		 * @type {ContributorsMap}
		 */
		this.contributorsMap = {}

		// Instances
		this.reposGetter = GetRepos.create(this.config)
		this.feedr = Feedr.create(this.config)

		// Chain
		return this
	}

	/**
	 * Forward the arguments onto the configured logger if it exists.
	 * @param {...*} args
	 * @chainable
	 * @returns {this}
	 * @private
	 */
	log(...args) {
		if (this.config.log) {
			this.config.log(...args)
		}
		return this
	}

	// =================================
	// Add

	/**
	 * Add a contributor to the internal listing and finish preparing it
	 * @param {Contributor} [contributor]
	 * @returns {Contributor}
	 * @private
	 */
	addContributor(contributor) {
		// Log
		this.log('debug', 'Adding the contributor:', contributor)

		// Prepare
		const contributorData = this.prepareContributor(contributor)

		// We need a username
		if (!contributorData.username) {
			this.log(
				'debug',
				'Contributor had no username, skipping add:',
				contributor
			)
			return null
		}

		// Find existing contributor
		contributorData.id = contributorData.username.toLowerCase()
		const existingContributorData = (this.contributorsMap[contributorData.id] =
			this.contributorsMap[contributorData.id] || {})

		// Merge contributorData into the existingContributorData
		extendr.deepDefaults(existingContributorData, contributorData)

		// Update references in database
		this.contributorsMap[contributorData.id] = existingContributorData
		this.contributorsMap[contributorData.id].repos =
			this.contributorsMap[contributorData.id].repos || {}

		// Return
		this.log('debug', 'Added the contributor:', contributor)
		return this.contributorsMap[contributorData.id]
	}

	// =================================
	// Format

	/**
	 * Prepare a contributor by setting and determing some defaults
	 * @param {Contributor} [contributor]
	 * @returns {Contributor}
	 * @private
	 */
	prepareContributor(contributor) {
		// Log
		this.log('debug', 'Preparing the contributor:', contributor)

		// Prepare
		const contributorData = cloneContributor(contributor)

		// Extract username
		if (contributorData.url && contributorData.username == null) {
			const usernameMatch = /^.+?github.com\/([^/]+).*$/.exec(
				contributorData.url
			)
			if (usernameMatch) {
				contributorData.username = (usernameMatch[1] || '').trim() || null
			}
		}

		// Return
		return contributorData
	}

	/**
	 * Prepare a contributor for return to the user, assume we have no more data, so determine the rest
	 * @param {Contributor} [contributor]
	 * @returns {Contributor}
	 * @private
	 */
	prepareContributorFinale(contributor) {
		// Log
		this.log(
			'debug',
			'Preparing the contributor for the final time:',
			contributor
		)

		// Prepare
		const contributorData = cloneContributor(contributor)

		// Fallbacks
		contributorData.name = contributorData.name || contributorData.username
		contributorData.url =
			contributorData.url || `https://github.com/${contributorData.username}`

		// Create text property
		const text = []
		text.push(contributorData.name)
		if (contributorData.email) {
			text.push(`<${contributorData.email}>`)
		}
		text.push(`(${contributorData.url})`)
		contributorData.text = text.join(' ') || null

		// Create markdown property
		contributorData.markdown = `[${contributorData.name}](${contributorData.url})`
		if (contributorData.email) {
			contributorData.markdown += ` <${contributorData.email}>`
		}

		// Return
		return contributorData
	}

	/**
	 * Prepare a contributor for return to the user, assume we have no more data, so determine the rest
	 * @param {Contributors|ContributorsMap} [contributors]
	 * @returns {Contributors}
	 * @private
	 */
	getContributors(contributors) {
		// Log
		this.log('debug', 'Get contributors')

		// Allow the user to pass in their own contributors array or object
		if (contributors == null) {
			contributors = this.contributorsMap
		}

		// Remove duplicates from array
		else if (typeChecker.isArray(contributors)) {
			const exists = {}
			contributors = contributors.filter(function(contributor) {
				if (exists[contributor.username] == null) {
					exists[contributor.username] = 0
				}
				++exists[contributor.username]
				return exists[contributor.username] === 1
			})
		}

		// Convert objects to arrays
		if (typeChecker.isPlainObject(contributors)) {
			contributors = Object.keys(contributors).map(key => contributors[key])
		}

		// Prepare the contributors that were passed in
		this.log(
			'debug',
			`Preparing the ${contributors.length} contributors for the final time`
		)
		contributors = contributors
			.map(this.prepareContributorFinale.bind(this))
			.sort(nameComparator)

		// Return
		return contributors
	}

	// =================================
	// Fetch

	/**
	 * Fetch Contributors from Usernames
	 * @param {Array<string>} [users] username, e.g. `['bevry', 'balupton']`
	 * @param {ContributorsCallback} [next]
	 * @chainable
	 * @returns {this}
	 * @public
	 */
	fetchContributorsFromUsers(users, next) {
		// Log
		this.log('debug', 'Get contributors from users:', users)

		// Fetch
		this.reposGetter.fetchReposFromUsers(users, (err, repos) => {
			// Check
			if (err) {
				return next(err, [])
			}

			// Filter out forks, return just their names
			const repoNames = repos
				.filter(repo => repo.fork !== true)
				.map(repo => repo.full_name)

			// Fetch the contributors for the repos
			return this.fetchContributorsFromRepos(repoNames, next)
		})

		// Chain
		return this
	}

	/**
	 * Fetch Contributors from Repository Names
	 * @param {Array<string>} [repos] repository names, e.g. `['bevry/getcontributors', 'bevry/getrepos']`
	 * @param {ContributorsCallback} [next]
	 * @chainable
	 * @returns {this}
	 * @public
	 */
	fetchContributorsFromRepos(repos, next) {
		// Log
		this.log('debug', 'Get contributors from repos:', repos)

		// Prepare
		const me = this
		const result = []
		const tasks = TaskGroup.create({ concurrency: 0 }).done(function(err) {
			if (err) {
				return next(err, [])
			}
			return next(null, me.getContributors(result))
		})

		// Add the contributors for each repo
		repos.forEach(function(repo) {
			tasks.addTask(`fetch github contributors for ${repo}`, function(
				complete
			) {
				me.fetchContributorsFromRepo(repo, function(err, contributors = []) {
					if (err) {
						return complete(err)
					}
					result.push(...contributors)
					return complete()
				})
			})

			tasks.addTask(`fetch package contributors for ${repo}`, function(
				complete
			) {
				me.fetchContributorsFromPackage(repo, function(err, contributors = []) {
					if (err) {
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
	 * Fetch Contributors from a Repository's package.json file if it has one
	 * @param {string} [repo] repository name, e.g. `'bevry/getcontributors'`
	 * @param {ContributorsCallback} [next]
	 * @chainable
	 * @returns {this}
	 * @public
	 */
	fetchContributorsFromPackage(repo, next) {
		// Log
		this.log('debug', 'Get contributors from package:', repo)

		// Prepare
		const me = this
		const feedOptions = {
			url: `http://raw.github.com/${repo}/master/package.json`,
			parse: 'json'
		}

		// Read the repo's package file
		this.feedr.readFeed(feedOptions, function(err, packageData) {
			// Ignore if error'd or no result
			if (err || !packageData) {
				return next(err, [])
			}

			// Prepare
			const addedContributors = []

			// Add each of the contributors
			const everyone = (packageData.contributors || []).concat(
				packageData.maintainers || []
			)
			everyone.forEach(function(contributor) {
				// Prepare
				let contributorData = {}

				// Extract
				if (typeChecker.isString(contributor)) {
					const contributorMatch = /^([^<(]+)\s*(?:<(.+?)>)?\s*(?:\((.+?)\))?$/.exec(
						contributor
					)
					if (!contributorMatch) {
						return
					}
					contributorData = {
						name: (contributorMatch[1] || '').trim() || null,
						email: (contributorMatch[2] || '').trim() || null,
						url: (contributorMatch[3] || '').trim() || null,
						repos: {}
					}
				} else if (typeChecker.isPlainObject(contributor)) {
					contributorData = {
						name: contributor.name || null,
						email: contributor.email || null,
						url: contributor.web || null,
						username: contributor.username || null,
						repos: {}
					}
				} else {
					return
				}

				// Add repo
				contributorData.repos[repo] = `https://github.com/${repo}`

				// Add contributor
				const addedContributor = me.addContributor(contributorData)
				if (addedContributor) {
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
	 * Fetch Contributors from a Repository's GitHub Contributor API
	 * @param {string} [repo] repository name, e.g. `'bevry/getcontributors'`
	 * @param {ContributorsCallback} [next]
	 * @chainable
	 * @returns {this}
	 * @public
	 */
	fetchContributorsFromRepo(repo, next) {
		// Log
		this.log('debug', 'Get contributors from repo:', repo)

		// Prepare
		const me = this
		const feedOptions = {
			url: `${ghapi}/repos/${repo}/contributors?per_page=100&${githubAuthQueryString}`,
			parse: 'json',
			requestOptions: {
				headers: {
					Accept: 'application/vnd.github.v3+json'
				}
			}
		}

		// Fetch the repo's contributors
		this.feedr.readFeed(feedOptions, function(err, responseData) {
			// Check
			if (err) {
				return next(err, [])
			} else if (responseData.message) {
				return next(new Error(responseData.message), [])
			} else if (!Array.isArray(responseData)) {
				return next(new Error('response was not an array of contributors'), [])
			} else if (responseData.length === 0) {
				return next(null, [])
			}

			// Prepare
			const addedContributors = []

			// Extract the correct data from the contributors
			responseData.forEach(function(contributor) {
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
				if (addedContributor) {
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
