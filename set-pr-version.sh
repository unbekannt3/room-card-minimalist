#!/bin/bash

# Script to create a release-please commit with specified version
# Usage: ./set-pr-version.sh <version>
# Example: ./set-pr-version.sh 1.2.0-beta.0

if [ -z "$1" ]; then
    echo "Error: Version parameter is required"
    echo "Usage: ./set-pr-version.sh <version>"
    echo "Example: ./set-pr-version.sh 1.2.0-beta.0"
    exit 1
fi

VERSION="$1"

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?$ ]]; then
    echo "Error: Invalid version format. Expected format: X.Y.Z or X.Y.Z-suffix"
    echo "Examples: 1.2.0, 1.2.0-beta.0, 1.2.0-alpha.1"
    exit 1
fi

echo "Creating release-please commit for version: $VERSION"

git commit --allow-empty \
    -m "chore: release $VERSION" \
    -m "Release-As: $VERSION"

if [ $? -eq 0 ]; then
    echo "Successfully created release commit for version $VERSION"
else
    echo "Failed to create commit"
    exit 1
fi
