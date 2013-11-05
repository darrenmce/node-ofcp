# ofcp

Open Face Chinese Poker

## Documentation

Instal poker-evaluator manually (npm struggles with the large data file).

```
git clone https://github.com/darrenmce/poker-evaluator.git
```

Afterwards, run:

```
npm install
```

needs a FIREBASE_CONFIG.json file in the root folder that contains:

```
{
    "ROOT": "https://<YOURFIREBASE>.firebaseio.com",
    "SECRET": "YOUR SECRET TO GENERATE AUTH TOKENS"
}
```

and your firebase security rules need to include the ofcp portion of:

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

to start app:

```
node index.js
```

then open your browser to http://localhost:3000

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Darren  
Licensed under the MIT license.
