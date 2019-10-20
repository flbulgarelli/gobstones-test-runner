#!/bin/bash

set -e

NEW_VERSION=$1
VERSION_REGEXP='[0-9]+\.[0-9]+\.[0-9]+'
FULL_VERSION_REGEXP="^${VERSION_REGEXP}$"

if [[ ! $NEW_VERSION =~ $FULL_VERSION_REGEXP ]]; then
  echo "First param should be a version like X.X.X"
  exit 1
fi

echo "[GobstonesTestRunner] Updating version..."
sed -i -r "s/VERSION = \"${VERSION_REGEXP}/VERSION = \"${NEW_VERSION}/" gem/lib/gobstones/test_runner/version.rb
sed -i -r "s/\"version\": \"${VERSION_REGEXP}/\"version\": \"${NEW_VERSION}/" package.json

echo "[GobstonesTestRunner] Running tests..."
npm test

echo "[GobstonesTestRunner] Commiting files..."
git commit gem/lib/gobstones/test_runner/version.rb package.json -m "Welcome ${NEW_VERSION}!"

echo "[GobstonesTestRunner] Tagging v$NEW_VERSION..."
git tag "v${NEW_VERSION}"

echo "[GobstonesTestRunner] Pushing..."
git push origin HEAD --tags

echo "[GobstonesTestRunner] Pushed. Travis will do the rest"
