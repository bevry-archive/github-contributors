/* eslint camelcase:0 */

// external
import type { StrictUnion } from 'simplytyped'
import Pool from 'native-promise-pool'
import Fellow from 'fellow'
import {
	getReposFromUsers,
	getReposFromSearch,
	MultiOptions,
} from '@bevry/github-repos'
import { query, GitHubCredentials } from '@bevry/github-api'
import fetch from 'node-fetch'
import { append } from '@bevry/list'

/** Collection of fellows */
export type Fellows = Set<Fellow>

/** Export some types we consume, so that others can also use them. */
export { Fellow }
export type { MultiOptions }

/** GitHub's response when an error occurs. */
interface GitHubError {
	message: string
}

/**
 * GitHub's response to getting a repository.
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
	/* Not sure what this means, however it is set to `"User"` in the example. */
	type: string
	/* Whether they are an admin */
	site_admin: boolean
	/** Count of how many contributions */
	contributions: number
}
export type GitHubContributorsResponse = StrictUnion<
	GitHubError | Array<GitHubContributor>
>

/**
 * GitHub's response to getting a user.
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

/**
 * Fetch the full profile information for a contributor.
 * @param url the full api url for the contributor data
 * @param credentials custom github credentials, omit to use the environment variables
 */
export async function getContributorProfile(
	url: string,
	credentials?: GitHubCredentials
): Promise<GitHubProfile> {
	// fetch
	const resp = await query({
		url,
		credentials,
		userAgent: '@bevry/github-contributors',
	})
	const data: GitHubProfileResponse = await resp.json()

	// check
	if (data.message) {
		return Promise.reject(new Error(data.message))
	}

	// return
	return data as GitHubProfile
}

/**
 * Fetch contributors from a Repository's GitHub Contributor API.
 * @param slug the repository slug to fetch the contributors for, e.g. `"bevry/github-contributors"`
 * @param opts custom search options
 * @param credentials custom github credentials, omit to use the environment variables
 */
export async function getContributorsFromRepoContributorData(
	slug: string,
	opts: MultiOptions = {},
	credentials?: GitHubCredentials
): Promise<Fellows> {
	// defaults
	if (opts.page == null) opts.page = 1
	if (opts.pages == null) opts.pages = 10
	if (opts.size == null) opts.size = 100

	// fetch
	// https://docs.github.com/en/rest/reference/repos#list-repository-contributors
	const resp = await query({
		pathname: `repos/${slug}/contributors`,
		searchParams: {
			page: String(opts.page),
			per_page: String(opts.size),
		},
		userAgent: '@bevry/github-contributors',
		credentials,
	})
	const data: GitHubContributorsResponse = await resp.json()

	// prepare
	const results: Fellows = new Set<Fellow>()

	// check
	if (data.message) throw new Error(data.message)
	if (!Array.isArray(data))
		throw new Error('response was not array of contributors')
	if (data.length === 0) return results

	// add these items
	const pool = new Pool(opts.concurrency)
	append(
		results,
		await Promise.all(
			data.map((contributor) =>
				pool.open(async () => {
					const profile = await getContributorProfile(
						contributor.url,
						credentials
					)
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
	)

	// add next items
	const within = opts.pages === 0 || opts.page < opts.pages
	const anotherPage = data.length === opts.size && within
	if (anotherPage)
		append(
			results,
			await getContributorsFromRepoContributorData(
				slug,
				{
					...opts,
					page: opts.page + 1,
				},
				credentials
			)
		)

	// return it all
	return results
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

/**
 * Fetch contributors from a repository's `package.json` file.
 * @param slug the repository slug for the package to fetch the contributors for, e.g. `"bevry/github-contributors"`
 */
export async function getContributorsFromRepoPackageData(
	slug: string
): Promise<Fellows> {
	// Fetch
	const url = `http://raw.github.com/${slug}/master/package.json`
	const resp = await fetch(url, {})
	const packageData: PackageData = await resp.json()

	// Process
	const added = new Set<Fellow>()
	if (packageData.author) {
		Fellow.add(packageData.author).forEach((fellow) => {
			fellow.authoredRepositories.add(slug)
			added.add(fellow)
		})
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

	// return
	return added
}

/**
 * Fetch contributors from a GitHub repository slug.
 * @param slug the repository slug to fetch the contributors for, e.g. `"bevry/github-contributors"`
 * @param opts custom search options
 * @param credentials custom github credentials, omit to use the environment variables
 */
export async function getContributorsFromRepo(
	slug: string,
	opts: MultiOptions = {},
	credentials?: GitHubCredentials
): Promise<Fellows> {
	return Fellow.flatten(
		await Promise.all([
			getContributorsFromRepoContributorData(slug, opts, credentials).catch(
				function (err) {
					console.warn(
						`unable to fetch contributors from commits for ${slug} - this can happen if the repository does not yet have a commit history`,
						err
					)
					return new Set<Fellow>()
				}
			),
			getContributorsFromRepoPackageData(slug).catch(function (err) {
				console.warn(
					`unable to fetch contributors from package for ${slug} - this can happen if the repository does not yet have a package.json file`,
					err
				)
				return new Set<Fellow>()
			}),
		])
	)
}

/**
 * Fetch contributors from GitHub repository slugs.
 * @param slugs array of repository slugs to fetch the contributors for, e.g. `["bevry/github-contributors"]`
 * @param opts custom search options
 * @param credentials custom github credentials, omit to use the environment variables
 */
export async function getContributorsFromRepos(
	slugs: Array<string>,
	opts: MultiOptions = {},
	credentials?: GitHubCredentials
): Promise<Fellows> {
	const pool = new Pool(opts.concurrency)
	return Fellow.flatten(
		await Promise.all(
			slugs.map((slug) =>
				pool.open(() => getContributorsFromRepo(slug, opts, credentials))
			)
		)
	)
}

/**
 * Fetch contributors for all repositories, within the GitHub organizations and usernames.
 * @param orgs fetch repositories for these orgs/users, such as `['bevry', 'browserstate']`
 * @param opts custom search options
 * @param credentials custom github credentials, omit to use the environment variables
 */
export async function getContributorsFromOrgs(
	orgs: Array<string>,
	opts: MultiOptions = {},
	credentials?: GitHubCredentials
): Promise<Fellows> {
	const repos = await getReposFromUsers(orgs, opts, credentials)

	// Filter out forks and grab the slugs
	const slugs = repos
		.filter((repo) => repo.fork !== true)
		.map((repo) => repo.full_name)

	// Fetch the contributors for the repos
	return getContributorsFromRepos(slugs, opts, credentials)
}

/**
 * Fetch contributors for all repositories that match a certain search query.
 * @param search the search query to send to GitHub, such as `@bevry language:typescript`
 * @param opts custom search options
 * @param credentials custom github credentials, omit to use the environment variables
 */
export async function getContributorsFromSearch(
	query: string,
	opts: MultiOptions = {},
	credentials?: GitHubCredentials
): Promise<Fellows> {
	const repos = await getReposFromSearch(query, opts, credentials)

	// Just grab the slugs
	const slugs = repos.map((repo) => repo.full_name)

	// Fetch the contributors for the repos
	return getContributorsFromRepos(slugs, opts, credentials)
}
