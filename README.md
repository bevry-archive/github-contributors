<!-- TITLE/ -->

<h1>Get Contributors</h1>

<!-- /TITLE -->

<!-- BADGES/ -->

<span class="badge-travisci"><a href="http://travis-ci.org/bevry/getcontributors" title="Check this project's build status on TravisCI"><img src="https://img.shields.io/travis/bevry/getcontributors/master.svg" alt="Travis CI Build Status" /></a></span>
<span class="badge-npmversion"><a href="https://npmjs.org/package/getcontributors" title="View this project on NPM"><img src="https://img.shields.io/npm/v/getcontributors.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/getcontributors" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/getcontributors.svg" alt="NPM downloads" /></a></span>
<span class="badge-daviddm"><a href="https://david-dm.org/bevry/getcontributors" title="View the status of this project's dependencies on DavidDM"><img src="https://img.shields.io/david/bevry/getcontributors.svg" alt="Dependency Status" /></a></span>
<span class="badge-daviddmdev"><a href="https://david-dm.org/bevry/getcontributors#info=devDependencies" title="View the status of this project's development dependencies on DavidDM"><img src="https://img.shields.io/david/dev/bevry/getcontributors.svg" alt="Dev Dependency Status" /></a></span>
<br class="badge-separator" />
<span class="badge-patreon"><a href="https://patreon.com/bevry" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span>
<span class="badge-flattr"><a href="https://flattr.com/profile/balupton" title="Donate to this project using Flattr"><img src="https://img.shields.io/badge/flattr-donate-yellow.svg" alt="Flattr donate button" /></a></span>
<span class="badge-liberapay"><a href="https://liberapay.com/bevry" title="Donate to this project using Liberapay"><img src="https://img.shields.io/badge/liberapay-donate-yellow.svg" alt="Liberapay donate button" /></a></span>
<span class="badge-thanksapp"><a href="https://givethanks.app/donate/npm/getcontributors" title="Donate to this project using Thanks App"><img src="https://img.shields.io/badge/thanksapp-donate-yellow.svg" alt="Thanks App donate button" /></a></span>
<span class="badge-boostlab"><a href="https://boost-lab.app/bevry/getcontributors" title="Donate to this project using Boost Lab"><img src="https://img.shields.io/badge/boostlab-donate-yellow.svg" alt="Boost Lab donate button" /></a></span>
<span class="badge-buymeacoffee"><a href="https://buymeacoffee.com/balupton" title="Donate to this project using Buy Me A Coffee"><img src="https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg" alt="Buy Me A Coffee donate button" /></a></span>
<span class="badge-opencollective"><a href="https://opencollective.com/bevry" title="Donate to this project using Open Collective"><img src="https://img.shields.io/badge/open%20collective-donate-yellow.svg" alt="Open Collective donate button" /></a></span>
<span class="badge-crypto"><a href="https://bevry.me/crypto" title="Donate to this project using Cryptocurrency"><img src="https://img.shields.io/badge/crypto-donate-yellow.svg" alt="crypto donate button" /></a></span>
<span class="badge-paypal"><a href="https://bevry.me/paypal" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>
<span class="badge-wishlist"><a href="https://bevry.me/wishlist" title="Buy an item on our wishlist for us"><img src="https://img.shields.io/badge/wishlist-donate-yellow.svg" alt="Wishlist browse button" /></a></span>

<!-- /BADGES -->

<!-- DESCRIPTION/ -->

Fetch all the contributors of all the specified github users repositories

<!-- /DESCRIPTION -->

<!-- INSTALL/ -->

<h2>Install</h2>

<a href="https://npmjs.com" title="npm is a package manager for javascript"><h3>npm</h3></a>

<ul>
<li>Install: <code>npm install --save getcontributors</code></li>
<li>Require: <code>require('getcontributors')</code></li>
</ul>

<h3><a href="https://editions.bevry.me" title="Editions are the best way to produce and consume packages you care about.">Editions</a></h3>

<p>This package is published with the following editions:</p>

<ul><li><code>getcontributors</code> aliases <code>getcontributors/source/index.js</code></li>
<li><code>getcontributors/source/index.js</code> is esnext source code with require for modules</li></ul>

<p>Environments older than Node.js v8 may need <a href="https://babeljs.io/docs/usage/polyfill/" title="A polyfill that emulates missing ECMAScript environment features">Babel's Polyfill</a> or something similar.</p>

<h3><a href="https://www.typescriptlang.org/" title="TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. ">TypeScript</a></h3>

This project provides its type information via inline <a href="http://usejsdoc.org" title="JSDoc is an API documentation generator for JavaScript, similar to Javadoc or phpDocumentor">JSDoc Comments</a>. To make use of this in <a href="https://www.typescriptlang.org/" title="TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. ">TypeScript</a>, set your <code>maxNodeModuleJsDepth</code> compiler option to `5` or thereabouts. You can accomlish this via your `tsconfig.json` file like so:

```json
{
    "compilerOptions": {
        "maxNodeModuleJsDepth": 5
    }
}
```

<!-- /INSTALL -->

## Usage

[API Documentation.](http://master.getcontributors.bevry.surge.sh/docs/)

```javascript
// Create our getcontributors instance
var getter = require('getcontributors').create({
    log: console.log // optional, arguments: level, message...
})

// Fetch all the contributors on these github repositories
getter.fetchContributorsFromRepos(['bevry/getcontributors'], function(
    err,
    contributors
) {
    console.log(err, contributors)

    // Fetch all the contributors on these github users/organisations
    getter.fetchContributorsFromUsers(['bevry'], function(err, contributors) {
        console.log(err, contributors)

        // Get the combined listing
        console.log(getter.getContributors())
    })
})
```

Contributors are returned as an array of contributor objects, here is an example contributor object:

```javascript
{
	name: "Benjamin Lupton",
	email: "b@lupton.cc",
	url: "https://github.com/balupton",
	username: "balupton",
	text: "Benjamin Lupton <b@lupton.cc> (https://github.com/balupton)",
	repos: {
		"bevry/docpad": "https://github.com/bevry/docpad",
		"bevry/getcontributors": "https://github.com/bevry/getcontributors"
		// ...
	}
}
```

<!-- HISTORY/ -->

<h2>History</h2>

<a href="https://github.com/bevry/getcontributors/blob/master/HISTORY.md#files">Discover the release history by heading on over to the <code>HISTORY.md</code> file.</a>

<!-- /HISTORY -->

<!-- CONTRIBUTE/ -->

<h2>Contribute</h2>

<a href="https://github.com/bevry/getcontributors/blob/master/CONTRIBUTING.md#files">Discover how you can contribute by heading on over to the <code>CONTRIBUTING.md</code> file.</a>

<!-- /CONTRIBUTE -->

<!-- BACKERS/ -->

<h2>Backers</h2>

<h3>Maintainers</h3>

These amazing people are maintaining this project:

<ul><li><a href="http://balupton.com">Benjamin Lupton</a> — <a href="https://github.com/bevry/getcontributors/commits?author=balupton" title="View the GitHub contributions of Benjamin Lupton on repository bevry/getcontributors">view contributions</a></li></ul>

<h3>Sponsors</h3>

No sponsors yet! Will you be the first?

<span class="badge-patreon"><a href="https://patreon.com/bevry" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span>
<span class="badge-flattr"><a href="https://flattr.com/profile/balupton" title="Donate to this project using Flattr"><img src="https://img.shields.io/badge/flattr-donate-yellow.svg" alt="Flattr donate button" /></a></span>
<span class="badge-liberapay"><a href="https://liberapay.com/bevry" title="Donate to this project using Liberapay"><img src="https://img.shields.io/badge/liberapay-donate-yellow.svg" alt="Liberapay donate button" /></a></span>
<span class="badge-thanksapp"><a href="https://givethanks.app/donate/npm/getcontributors" title="Donate to this project using Thanks App"><img src="https://img.shields.io/badge/thanksapp-donate-yellow.svg" alt="Thanks App donate button" /></a></span>
<span class="badge-boostlab"><a href="https://boost-lab.app/bevry/getcontributors" title="Donate to this project using Boost Lab"><img src="https://img.shields.io/badge/boostlab-donate-yellow.svg" alt="Boost Lab donate button" /></a></span>
<span class="badge-buymeacoffee"><a href="https://buymeacoffee.com/balupton" title="Donate to this project using Buy Me A Coffee"><img src="https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg" alt="Buy Me A Coffee donate button" /></a></span>
<span class="badge-opencollective"><a href="https://opencollective.com/bevry" title="Donate to this project using Open Collective"><img src="https://img.shields.io/badge/open%20collective-donate-yellow.svg" alt="Open Collective donate button" /></a></span>
<span class="badge-crypto"><a href="https://bevry.me/crypto" title="Donate to this project using Cryptocurrency"><img src="https://img.shields.io/badge/crypto-donate-yellow.svg" alt="crypto donate button" /></a></span>
<span class="badge-paypal"><a href="https://bevry.me/paypal" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>
<span class="badge-wishlist"><a href="https://bevry.me/wishlist" title="Buy an item on our wishlist for us"><img src="https://img.shields.io/badge/wishlist-donate-yellow.svg" alt="Wishlist browse button" /></a></span>

<h3>Contributors</h3>

These amazing people have contributed code to this project:

<ul><li><a href="http://balupton.com">Benjamin Lupton</a> — <a href="https://github.com/bevry/getcontributors/commits?author=balupton" title="View the GitHub contributions of Benjamin Lupton on repository bevry/getcontributors">view contributions</a></li></ul>

<a href="https://github.com/bevry/getcontributors/blob/master/CONTRIBUTING.md#files">Discover how you can contribute by heading on over to the <code>CONTRIBUTING.md</code> file.</a>

<!-- /BACKERS -->

<!-- LICENSE/ -->

<h2>License</h2>

Unless stated otherwise all works are:

<ul><li>Copyright &copy; 2013+ <a href="http://bevry.me">Bevry Pty Ltd</a></li></ul>

and licensed under:

<ul><li><a href="http://spdx.org/licenses/MIT.html">MIT License</a></li></ul>

<!-- /LICENSE -->
