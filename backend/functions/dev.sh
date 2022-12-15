#!/usr/bin/env bash

# Executable script to start a local development server
directory="$PWD"
if [[ $directory == *"functions"* ]]
then
    # Start build sequence
    echo "Initiating build sequence"
    firebase functions:config:get > .runtimeconfig.json &&
    cd .. &&
    firebase serve
else 
    echo "This script should be executed inside the functions directory"
fi