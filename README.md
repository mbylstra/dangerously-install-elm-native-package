# dangerously-install-elm-native-package
Dangerously install elm packages containing 'native' javascript code

This is a port of https://github.com/NoRedInk/elm-ops-tooling/blob/master/elm_self_publish.py to Node.js
It adds one feature: you can install directly from a github url.

usage example:
```
npm install -g dangerously-install-native-elm-package
cd {the directory of your elm project}
dangerously-install-native-elm-package https://github.com/tiziano88/elm-oauth/
dangerously-install-native-elm-package https://github.com/lukewestby/network-connection
```

current limitations:

- if the package you want to install has an dependencies, you'll need to install them manually first using elm package install (for example, elm-oauth depends on evancz/elm-http)
- if you try to install real packages after installing any native ones, elm package will complain with "Error: Your .elm/packages/ directory may be corrupted."

This is very alpha status.
