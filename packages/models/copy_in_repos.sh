#!/bin/sh

rm -rf ../dappy-lookup/src/models/*
cp -r ./src/* ../dappy-lookup/src/models/

rm -rf ../dappy-node/src/models/*
cp -r ./src/* ../dappy-node/src/models/

rm -rf ../gossip/src/models/*
cp -r ./src/* ../gossip/src/models/