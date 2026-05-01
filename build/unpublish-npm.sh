#!/bin/bash

REGISTRY="https://npmjs-registry.ivyteam.ch/"

pnpm unpublish "@axonivy/cms-editor@${1}" --registry $REGISTRY
pnpm unpublish "@axonivy/cms-editor-protocol@${1}" --registry $REGISTRY
