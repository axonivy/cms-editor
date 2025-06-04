#!/bin/bash
CMS_TEST_PROJECT_NAME="cms-test-project"

if [ -z "$1" ]; then
  echo "Error: Please provide the path to the core repository as an argument. E.g.: './scripts/playwrightInit.sh /home/ivy/dev/core'"
  exit 1
fi
CMS_TEST_PROJECT_DIR="$(pwd)/playwright/$CMS_TEST_PROJECT_NAME"
if [ ! -d "$CMS_TEST_PROJECT_DIR" ]; then
  echo "Error: $CMS_TEST_PROJECT_NAME was not found at '$CMS_TEST_PROJECT_DIR'. Execute the script from the repository root."
  exit 1
fi

TARGET_DIR="$1/workspace/ch.ivyteam.ivy.server.file.feature/target/server-root/data/workspaces/Developer/$CMS_TEST_PROJECT_NAME"
mkdir -p "$TARGET_DIR"
if [ -L "$TARGET_DIR/$CMS_TEST_PROJECT_NAME" ]; then
  rm "$TARGET_DIR/$CMS_TEST_PROJECT_NAME"
fi
ln -s "$(pwd)/playwright/$CMS_TEST_PROJECT_NAME" "$TARGET_DIR/$CMS_TEST_PROJECT_NAME"
