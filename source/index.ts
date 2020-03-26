/* eslint camelcase:0 */

// Import
import type { StrictUnion } from 'simplytyped'
import fetch from 'cross-fetch'
import Fellow from 'fellow'
import { getReposFromUsers, getReposFromSearch, SearchOptions } from 'getrepos'
import githubAuthQueryString from 'githubauthquerystring'
const ghapi = process.env.GITHUB_API || 'https://api.github.com'

type Fellows = Set<Fellow>

/** Continue despite certain errors */
function ignore(err: Error) {
	console.warn(err)
	return new Set<Fellow>()
}

/**
 * GitHub's response to getting a repository
 * https://developer.github.com/v3/repos/#list-contributors
 */
export type ContributorsResponse = StrictUnion<
	| Array<{
			login: string
			id: number
			node_id: string
			avatar_url: string
			gravatar_id: string
			url: string
			html_url: string
			followers_url: string
			following_url: string
			gists_url: string
			starred_url: string
			subscriptions_url: string
			organizations_url: string
			repos_url: string
			events_url: string
			received_events_url: string
			type: string
			site_admin: false
			contributions: number
	  }>
	| { message: string }
>

//

/** Fetch Contributors from a Repository's GitHub Contributor API */
export async function getContributorsFromCommits(
	slug: string
): Promise<Fellows> {
	// Fetch
	const url = `${ghapi}/repos/${slug}/contributors?per_page=100&${githubAuthQueryString}`
	const resp = await fetch(url, {
		headers: {
			Accept: 'application/vnd.github.v3+json',
		},
	})
	const responseData = (await resp.json()) as ContributorsResponse

	// Check
	if (responseData.message) {
		return Promise.reject(new Error(responseData.message))
	} else if (!Array.isArray(responseData)) {
		return Promise.reject(
			new Error('response was not an array of contributors')
		)
	}

	// Process
	const added = new Set<Fellow>()
	for (const user of responseData) {
		const fellow = Fellow.ensure({
			github: user,
			githubUsername: user.login,
			githubUrl: user.html_url,
		})
		fellow.contributedRepositories.add(slug)
		added.add(fellow)
	}

	// Return
	return added
}

/** The GitHub API person fields we use */
interface PackagePerson {
	name?: string
	email?: string
	username?: string
	web?: string
}

/** The GitHub API package response fields we use */
interface PackageData {
	author?: string | PackagePerson
	contributors?: Array<string | PackagePerson>
	maintainers?: Array<string | PackagePerson>
}

/** Fetch contributors from a repository's `package.json` file */
export async function getContributorsFromPackage(
	slug: string
): Promise<Fellows> {
	// Fetch
	const url = `http://raw.github.com/${slug}/master/package.json`
	const resp = await fetch(url, {
		headers: {
			Accept: 'application/vnd.github.v3+json',
		},
	})
	const packageData = (await resp.json()) as PackageData

	// Process
	const added = new Set<Fellow>()
	if (packageData.author) {
		const fellow = Fellow.ensure(packageData.author)
		fellow.authoredRepositories.add(slug)
		added.add(fellow)
	}
	for (const contributor of packageData.contributors || []) {
		const fellow = Fellow.ensure(contributor)
		fellow.contributedRepositories.add(slug)
		added.add(fellow)
	}
	for (const maintainer of packageData.maintainers || []) {
		const fellow = Fellow.ensure(maintainer)
		fellow.contributedRepositories.add(slug)
		added.add(fellow)
	}

	// Return
	return added
}

/** Fetch contributors from a GitHub repository slug */
export async function getContributorsFromRepo(slug: string): Promise<Fellows> {
	return Fellow.flatten(
		await Promise.all([
			getContributorsFromCommits(slug),
			getContributorsFromPackage(slug).catch(ignore),
		])
	)
}

/** Fetch contributors from GitHub repository slugs (e.g. `bevry/getcontributors`) */
export async function getContributorsFromRepos(
	slugs: Array<string>
): Promise<Fellows> {
	return Fellow.flatten(
		await Promise.all(slugs.map((slug) => getContributorsFromRepo(slug)))
	)
}

/** Fetch contributors for all repositories, within the GitHub organisations and usernames (e.g. `bevry`, `balupton`) */
export async function getContributorsFromOrgs(
	orgs: Array<string>
): Promise<Fellows> {
	const repos = await getReposFromUsers(orgs)

	// Filter out forks and grab the slugs
	const slugs = repos
		.filter((repo) => repo.fork !== true)
		.map((repo) => repo.full_name)

	// Fetch the contributors for the repos
	return getContributorsFromRepos(slugs)
}

/** Fetch contributors for all repositories that match a certain search query */
export async function getContributorsFromSearch(
	query: string,
	opts: SearchOptions
): Promise<Fellows> {
	const repos = await getReposFromSearch(query, opts)

	// Just grab the slugs
	const slugs = repos.map((repo) => repo.full_name)

	// Fetch the contributors for the repos
	return getContributorsFromRepos(slugs)
}
