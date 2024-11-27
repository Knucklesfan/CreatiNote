#!/bin/bash
function build-creatinote() {
    docker build -t $NAME .
    docker tag $NAME:latest $NAME:staging
}
function execute-creatinote() {
    CREATINOTEDB_ROOT_PASSWORD=test CREATINOTEDB_PASSWORD=test docker-compose up
}
if [[ "$*" == *"r"* ]]; then
    echo "Building a RELEASE BUILD!"
    NAME=creatinote
    INSTANCE=creatinote-instance # yeah, i know that release and debug generate the same build... :/
else
    echo "Building a DEBUG BUILD!"
    NAME=creatinote
    INSTANCE=creatinote-instance

fi
if build-creatinote; then
    if [[ "$*" == *"x"* ]]; then
        echo "Build finished, executing:"
        execute-creatinote
    else
        echo "Build Job Finished! Please read for errors if there are any."
    fi
else
    echo "Build failed for whatever reason! Check the logs!"
fi
