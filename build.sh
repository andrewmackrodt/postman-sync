#!/bin/bash
set -euo pipefail

project_dir="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
build_dir="$project_dir/build"
packages_dir="$project_dir/packages"
package_dir="$packages_dir/sync-client"

mkdir -p "$build_dir"
cd "$package_dir"
tsc --sourcemap --outDir "$build_dir"

cd "$build_dir"
yarn install --production=true --modules-folder="$PWD/node_modules" --frozen-lockfile
rm -f "node_modules/@postman-sync"/{postman-sdk,sync-client}
mv postman-sdk/ node_modules/@postman-sync/postman-sdk/
cp "$packages_dir/postman-sdk/package.json" node_modules/@postman-sync/postman-sdk/

mv sync-client/* .
rmdir sync-client/
