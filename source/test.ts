// Import
import { equal } from 'assert-helpers'
import kava from 'kava'
import * as getter from './index.js'
import { StrictUnion } from 'simplytyped'

type Errback = (error?: Error) => void

function long(result: StrictUnion<Set<getter.Fellow> | Array<getter.Fellow>>) {
	const size = result.size || result.length || 0
	equal(size > 0, true, `more than one result, it had ${size}`)
}

function check(done: Errback, log: boolean = false) {
	return function (result: any) {
		if (log) console.log(result)
		long(result)
		setImmediate(done)
	}
}

// Test
kava.suite('@bevry/github-contributors', function (suite, test) {
	test('package', function (done) {
		getter
			.getContributorsFromRepoPackageData('bevry/ambi')
			.then(check(done, true))
			.catch(done)
	})
	test('commits', function (done) {
		getter
			.getContributorsFromRepoContributorData('bevry/github-contributors')
			.then(check(done, true))
			.catch(done)
	})
	test('singleton', function () {
		long(getter.Fellow.contributesRepository('bevry/github-contributors'))
	})
	test('repo', function (done) {
		getter
			.getContributorsFromRepo('bevry/github-contributors')
			.then(check(done))
			.catch(done)
	})
	test('repos', function (done) {
		getter
			.getContributorsFromRepos(['bevry/github-contributors'])
			.then(check(done))
			.catch(done)
	})
	test('orgs', function (done) {
		getter
			.getContributorsFromOrgs(['browserstate'])
			.then(check(done))
			.catch(done)
	})
})
