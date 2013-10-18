# ofcp

Open Face Chinese Poker

## Documentation
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

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Darren  
Licensed under the MIT license.
