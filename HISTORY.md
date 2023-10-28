# History

## v4.0.0 2023 November 1

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)
-   Updated license from [`MIT`](http://spdx.org/licenses/MIT.html) to [`Artistic-2.0`](http://spdx.org/licenses/Artistic-2.0.html)
-   Minimum required node version changed from `node: >=10` to `node: >=18` to keep up with mandatory ecosystem changes
-   No longer uses `node-fetch`, instead uses the [Node.js `fetch` builtin](https://nodejs.org/api/globals.html#fetch)

## v3.0.0 2021 August 5

-   Iterate/support pages
-   Renamed to `@bevry/github-contributors`
-   Renamed `getContributorsFromCommits` to `getContributorsFromRepoContributorData`
-   Renamed `getContributorsFromPackage` to `getContributorsFromRepoPackageData`
-   Updated for [`@bevry/github-api`](https://github.com/bevry/github-api)
-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.23.0 2020 October 29

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.22.0 2020 September 4

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.21.0 2020 August 18

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.20.0 2020 August 4

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.19.0 2020 July 22

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.18.0 2020 July 22

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.17.0 2020 June 25

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.16.0 2020 June 21

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.15.0 2020 June 21

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.14.0 2020 June 20

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.13.0 2020 June 10

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.12.0 2020 June 10

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.11.0 2020 May 22

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.10.0 2020 May 21

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.9.0 2020 May 20

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.8.0 2020 May 11

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.7.0 2020 May 8

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.6.0 2020 May 6

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.5.2 2020 April 27

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.5.1 2020 March 30

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v2.5.0 2020 March 30

-   `getContributorsFromRepo` no longer hard fails
    -   enables compat with new repos

## v2.4.0 2020 March 27

-   Fix for multiple authors inside `package.json:author`

## v2.3.0 2020 March 27

-   No longer log the warning if fetching packages fail, just continue silently
-   Updated for [GitHub's new authorization recommendations](https://developer.github.com/changes/2020-02-10-deprecating-auth-through-query-param)
-   Export the Fellow import we are using to ensure singelton compatability

## v2.2.0 2020 March 27

-   Export the Fellow import we are using to ensure singelton compatability

## v2.1.0 2020 March 27

-   Fetch the contributor's profile information (such that we have their names), instead of just their contributor data (their usernames)

## v2.0.0 2020 March 27

-   Rewrote in TypeScript with breaking API changes for simplicity as new native abilities allows us to do more with less
-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)
-   Minimum required node version changed from `node: >=8` to `node: >=10` to keep up with mandatory ecosystem changes

## v1.10.0 2019 December 9

-   Implemented support for `GITHUB_API` environment variable to access the GitHub API via a proxy
-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v1.9.0 2019 November 18

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v1.8.0 2019 November 13

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v1.7.0 2019 November 10

-   Updated [base files](https://github.com/bevry/base) and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v1.6.0 2019 November 9

-   Updated [base files](https://github.com/bevry/base) and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v1.5.0 2019 September 10

-   Corrected the jsdoc types
-   Now uses [githubauthquerystring](https://github.com/bevry/githubauthquerystring) for github auth query string, instead of the configuration object
-   Updated [base files](https://github.com/bevry/base) and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)
-   Updated dependencies

## v1.4.5 2017 February 28

-   Updated dependencies

## v1.4.4 2017 February 28

-   Internal: explicit use of GitHub API version
-   Updated dependencies

## v1.4.3 2017 February 28

-   Pass configuration over to getrepos instance like how we do with the feedr instance

## v1.4.2 2017 February 27

-   Updated dependencies

## v1.4.1 2017 February 24

-   Fixed rate limit errors not being caught

## v1.4.0 2017 February 24

-   Converted from CoffeeScript to JavaScript
-   Fixed `fetchContributorsFromPackage` possibly not calling the completion callback under certain circumstances
    -   See [feedr issue #7](https://github.com/bevry/feedr/issues/7) for more details
-   Added technical API documentation
-   Updated dependencies

## v1.3.7 2014 December 11

-   Updated dependencies

## v1.3.6 2014 December 11

-   Updated dependencies

## v1.3.5 2014 December 11

-   Updated dependencies

## v1.3.4 2013 December 16

-   Added markdown field to contributor objects

## v1.3.3 2013 November 27

-   Updated dependencies

## v1.3.2 2013 November 25

-   Updated dependencies
-   Repackaged

## v1.3.1 2013 October 3

-   Updated dependencies

## v1.3.0 2013 October 2

-   Even more powerful
-   Updated dependencies

## v1.2.0 2013 September 20

-   Rewrote to expose more powerful API
-   Updated dependencies

## v1.1.1 2013 May 7

-   Better merging of contributor data between sources

## v1.1.0 2013 May 7

-   Also fetch contributors from the GitHub API
-   Ignore repos that are forks
-   We pass our configuration onto feedr instances

## v1.0.2 2013 April 11

-   Fix `Cannot find module 'typeChecker'`

## v1.0.1 2013 April 10

-   Updated dependencies

## v1.0.0 2013 March 14

-   Initial working version
