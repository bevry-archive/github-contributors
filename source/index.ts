/* eslint camelcase:0 */

// Import
import type { StrictUnion } from 'simplytyped'
import fetch from 'cross-fetch'
import Fellow from 'fellow'
import { getReposFromUsers, getReposFromSearch, SearchOptions } from 'getrepos'
import { githubAuthorizationHeader } from 'githubauthreq'
const ghapi = process.env.GITHUB_API || 'https://api.github.com'

/** Collection of fellows */
export type Fellows = Set<Fellow>

/** Export the Fellow class we have imported and are using, such that consumers of this package and ensure they are interacting with the same singletons */
export { Fellow }

/** Continue despite certain errors */
function ignore() {
	// console.warn(err)
	return new Set<Fellow>()
}

/** GitHub's response when an error occurs */
interface GitHubError {
	message: string
}

/**
 * GitHub's response to getting a repository
 * https://developer.github.com/v3/repos/#list-contributors
 */
export interface GitHubContributor {
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
	site_admin: boolean
	contributions: number
}
export type GitHubContributorsResponse = StrictUnion<
	GitHubError | Array<GitHubContributor>
>

/**
 * GitHub's response to getting a user
 * https://developer.github.com/v3/users/#get-a-single-user
 */
export interface GitHubProfile {
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
	name: string
	company: string
	blog: string
	location: string
	email: string
	hireable: boolean
	bio: string
	public_repos: number
	public_gists: number
	followers: number
	following: number
	created_at: string
	updated_at: string
}
export type GitHubProfileResponse = StrictUnion<GitHubError | GitHubProfile>

/** Fetch the full profile information for a contributor */
export async function getContributorProfile(
	url: string
): Promise<GitHubProfile> {
	const resp = await fetch(url, {
		headers: {
			Authorization: githubAuthorizationHeader(),
			Accept: 'application/vnd.github.v3+json',
		},
	})
	const responseData = (await resp.json()) as GitHubProfileResponse

	// Check
	if (responseData.message) {
		return Promise.reject(new Error(responseData.message))
	}

	// Return
	return responseData as GitHubProfile
}

/** Fetch contributors from a Repository's GitHub Contributor API */
export async function getContributorsFromCommits(
	slug: string
): Promise<Fellows> {
	// Fetch
	const url = `${ghapi}/repos/${slug}/contributors?per_page=100`
	const resp = await fetch(url, {
		headers: {
			Authorization: githubAuthorizationHeader(),
			Accept: 'application/vnd.github.v3+json',
		},
	})
	const responseData = (await resp.json()) as GitHubContributorsResponse

	// Check
	if (responseData.message) {
		return Promise.reject(new Error(responseData.message))
	} else if (!Array.isArray(responseData)) {
		return Promise.reject(
			new Error('response was not an array of contributors')
		)
	} else if (responseData.length === 0) {
		return new Set<Fellow>()
	}

	// Process
	return new Set<Fellow>(
		await Promise.all(
			responseData.map(async function (contributor) {
				const profile = await getContributorProfile(contributor.url)
				const fellow = Fellow.ensure({
					githubProfile: profile,
					name: profile.name,
					email: profile.email,
					description: profile.bio,
					company: profile.company,
					location: profile.location,
					homepage: profile.blog,
					hireable: profile.hireable,
					githubUsername: profile.login,
					githubUrl: profile.html_url,
				})
				fellow.contributions.set(slug, contributor.contributions)
				if (contributor.site_admin) {
					fellow.administeredRepositories.add(slug)
				}
				fellow.contributedRepositories.add(slug)
				return fellow
			})
		)
	)
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
	const resp = await fetch(url)
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
