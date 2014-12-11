
<!-- TITLE/ -->

# Get Contributors

<!-- /TITLE -->


<!-- BADGES/ -->

[![Build Status](https://img.shields.io/travis/bevry/getcontributors/master.svg)](http://travis-ci.org/bevry/getcontributors "Check this project's build status on TravisCI")
[![NPM version](https://img.shields.io/npm/v/getcontributors.svg)](https://npmjs.org/package/getcontributors "View this project on NPM")
[![NPM downloads](https://img.shields.io/npm/dm/getcontributors.svg)](https://npmjs.org/package/getcontributors "View this project on NPM")
[![Dependency Status](https://img.shields.io/david/bevry/getcontributors.svg)](https://david-dm.org/bevry/getcontributors)
[![Dev Dependency Status](https://img.shields.io/david/dev/bevry/getcontributors.svg)](https://david-dm.org/bevry/getcontributors#info=devDependencies)<br/>
[![Gratipay donate button](https://img.shields.io/gratipay/bevry.svg)](https://www.gratipay.com/bevry/ "Donate weekly to this project using Gratipay")
[![Flattr donate button](https://img.shields.io/badge/flattr-donate-yellow.svg)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QB8GQPZAH84N6 "Donate once-off to this project using Paypal")
[![BitCoin donate button](https://img.shields.io/badge/bitcoin-donate-yellow.svg)](https://coinbase.com/checkouts/9ef59f5479eec1d97d63382c9ebcb93a "Donate once-off to this project using BitCoin")
[![Wishlist browse button](https://img.shields.io/badge/wishlist-donate-yellow.svg)](http://amzn.com/w/2F8TXKSNAFG4V "Buy an item on our wishlist for us")

<!-- /BADGES -->


<!-- DESCRIPTION/ -->

Fetch all the contributors of all the specified github users repositories

<!-- /DESCRIPTION -->


<!-- INSTALL/ -->

## Install

### [NPM](http://npmjs.org/)
- Use: `require('getcontributors')`
- Install: `npm install --save getcontributors`

<!-- /INSTALL -->


## Usage

``` javascript
// Create our getcontributors instance
var getter = require('getcontributors').create({
	githubClientId: null,      // optional, will try process.env.GITHUB_CLIENT_ID
	githubClientSecret: null,  // optional, will try process.env.GITHUB_CLIENT_SECRET
	log: console.log           // optional, arguments: level, message... 
});

// Fetch all the contributors on these github repositories
getter.fetchContributorsFromRepos(['bevry/getcontributors'], function(err, contributors){
	console.log(err, contributors);

	// Fetch all the contributors on these github users/organisations
	getter.fetchContributorsFromUsers(['bevry'], function(err, contributors){
		console.log(err, contributors);

		// Get the combined listing
		console.log(getter.getContributors());
	});
});
```

Contributors are returned as an array of contributor objects, here is an example contributor object:

``` javascript
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

## History
[Discover the change history by heading on over to the `HISTORY.md` file.](https://github.com/bevry/getcontributors/blob/master/HISTORY.md#files)

<!-- /HISTORY -->


<!-- CONTRIBUTE/ -->

## Contribute

[Discover how you can contribute by heading on over to the `CONTRIBUTING.md` file.](https://github.com/bevry/getcontributors/blob/master/CONTRIBUTING.md#files)

<!-- /CONTRIBUTE -->


<!-- BACKERS/ -->

## Backers

### Maintainers

These amazing people are maintaining this project:

- Benjamin Lupton <b@lupton.cc> (https://github.com/balupton)

### Sponsors

No sponsors yet! Will you be the first?

[![Gratipay donate button](https://img.shields.io/gratipay/bevry.svg)](https://www.gratipay.com/bevry/ "Donate weekly to this project using Gratipay")
[![Flattr donate button](https://img.shields.io/badge/flattr-donate-yellow.svg)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QB8GQPZAH84N6 "Donate once-off to this project using Paypal")
[![BitCoin donate button](https://img.shields.io/badge/bitcoin-donate-yellow.svg)](https://coinbase.com/checkouts/9ef59f5479eec1d97d63382c9ebcb93a "Donate once-off to this project using BitCoin")
[![Wishlist browse button](https://img.shields.io/badge/wishlist-donate-yellow.svg)](http://amzn.com/w/2F8TXKSNAFG4V "Buy an item on our wishlist for us")

### Contributors

These amazing people have contributed code to this project:

- [Benjamin Lupton](https://github.com/balupton) <b@lupton.cc> — [view contributions](https://github.com/bevry/getcontributors/commits?author=balupton)

[Become a contributor!](https://github.com/bevry/getcontributors/blob/master/CONTRIBUTING.md#files)

<!-- /BACKERS -->


<!-- LICENSE/ -->

## License

Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT license](http://creativecommons.org/licenses/MIT/)

Copyright &copy; 2013+ Bevry Pty Ltd <us@bevry.me> (http://bevry.me)

<!-- /LICENSE -->


