#!/bin/bash
function build-creatinote() {
    docker build -t $NAME .
}
function execute-creatinote() {
    docker run -it --rm -p 8080:8080 --name $INSTANCE $NAME
}
if [[ "$*" == *"r"* ]]; then
    echo "Building a RELEASE BUILD!"
    NAME=creatinote-release
    INSTANCE=creatinote-release-instance
else
    echo "Building a DEBUG BUILD!"
    NAME=creatinote-debug
    INSTANCE=creatinote-debug-instance

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
