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
require('getcontributors')({
	users: ['bevry'],
	github_client_id: null, // optional
	github_client_secret: null, // optional
	log: console.log, // args: level, message...
	next: console.log // args: err, contributors
})
```

Contributors are returned as an array of contributor objects, here is an examply contributor object:

``` javascript
{
	name: "Benjamin Lupton",
	email: "b@lupton.cc",
	url: "https://github.com/balupton",
	username: "balupton",
	text: "Benjamin Lupton <b@lupton.cc> (https://github.com/balupton)",
	repos: {
		docpad: "https://github.com/bevry/docpad",
		getcontributors: "https://github.com/bevry/getcontributors"
		// ...
	}
}
```


## History

You can discover the history inside the `History.md` file


## License

Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012 [Bevry Pty Ltd](http://bevry.me)
