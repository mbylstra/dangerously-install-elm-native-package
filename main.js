#!/usr/bin/env node

var git = require("nodegit");
var dashdash = require('dashdash');
var rp = require('request-promise');
var fs = require('fs');
var fsp = require('fs-promise');
var untildify = require('untildify');
var jsonfile = require('jsonfile');

main();

function main() {

  var programOptions = dashdash.parse(
    {
      options: [
        {
          names: ['projectdir'],
          type: 'string',
        }
      ]
    });
  var programArgs = programOptions._args;

  if (programArgs.length != 1) {
    console.log("You must specify the URL of a git repository as an argument");
  } else {
    var gitUrl = programArgs[0];
    var elmProjectDir = programOptions.projectdir
      ? fs.realpathSync(untildify(programOptions.projectdir))
      : fs.realpathSync('.');
    var packageDetails = getPackageDetails(gitUrl);
    var user = packageDetails.user;
    var project = packageDetails.project;
    var packageName = `${user}/${project}`;

    fetchElmPackageData(gitUrl).then(function(packageData) {
      var version = packageData.version;
      var projectVersionPackageDir = getProjectVersionPackageDir(elmProjectDir, gitUrl, version);
      console.log('☠☠☠ Commence taking a walk on the wild side.');
      console.log(`☠☠☠ Cloning '${gitUrl}' to '${projectVersionPackageDir}'`);
      return cloneRepo(gitUrl, projectVersionPackageDir).then(
        function() {
          addToExactDepsJsonFile(elmProjectDir, packageName, version);
          addToElmPackageJsonFileDependencies(elmProjectDir, packageName, version);
          console.log('☠☠☠ Done! Runtime errors here we come baby!');
        },
        function() {
          console.log(`'${packageName}' has already been installed! You'll need to delete it from your elm-stuff first.`);
        }
      );
    });
  }
}

/**
 * download and read the contents of an elm-package.json file on github
 * @param  {String} gitUrl
 * @return {Promise of type object}
 */
function fetchElmPackageData(gitUrl) {
  var elmPackageJsonUrl =
    gitUrl.replace('github.com', 'raw.githubusercontent.com')
      + '/master/elm-package.json';
  return rp(elmPackageJsonUrl).then(function(body) {
    // console.log(body);
    var elmPackageData = JSON.parse(body);
    // console.log(elmPackageData);
    return JSON.parse(body);
  });
}


/**
 * get the user name and project name from a github url
 * @param  {string} gitUrl
 * @return { 'project': String, 'user': String }
 */
function getPackageDetails(gitUrl) {
  // eg: https://github.com/lukewestby/network-connection
  var parts = gitUrl.split('/');
  project = parts[parts.length - 1];
  user = parts[parts.length - 2];

  return {
    "project": project,
    "user": user
  }
}

function cloneRepo(url, destination) {
  return git.Clone(url, destination);
}

function getProjectVersionPackageDir(elmProjectDir, gitUrl, version) {
  var packageDetails = getPackageDetails(gitUrl);
  return `${elmProjectDir}/elm-stuff/packages/${packageDetails.user}/${packageDetails.project}/${version}`;
}

function addToExactDepsJsonFile(elmProjectDir, packageName, version) {
  var exactDepsFilePath = `${elmProjectDir}/elm-stuff/exact-dependencies.json`;
  var exactDeps = jsonfile.readFileSync(exactDepsFilePath);
  exactDeps[packageName] = version;
  jsonfile.writeFileSync(exactDepsFilePath, exactDeps, {spaces: 2});
}

function addToElmPackageJsonFileDependencies(elmProjectDir, packageName, version) {
  var filePath = `${elmProjectDir}/elm-package.json`;
  var elmPackageData = jsonfile.readFileSync(filePath);
  elmPackageData.dependencies[packageName] = `${version} <= v <= ${version}`;
  jsonfile.writeFileSync(filePath, elmPackageData, {spaces: 2});
}
