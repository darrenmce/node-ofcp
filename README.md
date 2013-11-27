# ofcp

Open Face Chinese Poker

## Documentation

Requires [MongoDB][mongo] (currently uses default DB at localhost with name test.. will be configurable in next commit!)

[mongo]: http://mongodb.com

Sign up for a firebase account if you do not have one [here][firebase]

[firebase]: http://www.firebase.com

In your forge (https://_username_.firebaseio.com/), under the Auth section you will need a Firebase Secret for a later step.

and your firebase security rules need to include the ofcp portion of (or just copy&paste the whole thing):

```
{
  "rules": {
    "ofcp" : {
      "$ofcpID": {
        ".write" : "auth.root == 'ofcp' && auth.write == true",
        ".read": "auth.root == 'ofcp' && auth.read == true"
      }
    }
  }
}
```

Configure and Install Deps

```
./install.sh
```

Use grunt to initialize app in the environmnet desired (dev will run lin/tests)

```
grunt [dev|prod]
```

to start app:

```
node index.js
```

then open your browser to the address/port you specified in the install script

## Examples
I run the latest version under [http://darrenmce.com][exampleurl]

[exampleurl]: http://darrenmce.com

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Darren McElligott
Licensed under the MIT license.
