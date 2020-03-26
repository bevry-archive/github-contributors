// Import
import { equal } from 'assert-helpers'
import { suite, Errback } from 'kava'
import * as getter from './'

function check(done: Errback, log: boolean = false) {
	return function (result: any) {
		if (log) console.log(result)
		const size = result.size || result.length
		equal(size > 0, true, `more than one result, it had ${size}`)
		setImmediate(done)
	}
}

// Test
suite('getcontributors', function (suite, test) {
	test('package', function (done) {
		getter
			.getContributorsFromPackage('bevry/getcontributors')
			.then(check(done, true))
			.catch(done)
	})
	test('commits', function (done) {
		getter
			.getContributorsFromCommits('bevry/getcontributors')
			.then(check(done, true))
			.catch(done)
	})
	test('repo', function (done) {
		getter
			.getContributorsFromRepo('bevry/getcontributors')
			.then(check(done))
			.catch(done)
	})
	test('repos', function (done) {
		getter
			.getContributorsFromRepos(['bevry/getcontributors'])
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
