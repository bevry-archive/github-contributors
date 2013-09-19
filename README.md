# Get Contributors

[![Build Status](https://secure.travis-ci.org/bevry/getcontributors.png?branch=master)](http://travis-ci.org/bevry/getcontributors)
[![NPM version](https://badge.fury.io/js/getcontributors.png)](https://npmjs.org/package/getcontributors)
[![Flattr this project](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr)

Fetch the contributors of the repositories of the specified github users


## Install

```
npm install --save getcontributors
```


## Usage

``` javascript
// Create our contributors instance
var contributors = require('getcontributors').create({
	githubClientId: null,      // optional, will try process.env.GITHUB_CLIENT_ID
	githubClientSecret: null,  // optional, will try process.env.GITHUB_CLIENT_SECRET
	log: console.log           // optional, arguments: level, message... 
});

// Fetch all the contributors on these github repositories
contributors.fetchContributorsFromRepos(['bevry/getcontributors'], function(err){
	console.log(err);

	// Fetch all the contributors on these github users/organisations
	contributors.fetchContributorsFromUsers(['bevry'], function(err){
		console.log(err);

		// Get the combined listing
		console.log(contributors.getContributors());
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


## History
You can discover the history inside the `History.md` file


## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012+ [Bevry Pty Ltd](http://bevry.me)
