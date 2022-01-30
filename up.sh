#!/bin/bash

if [[ $1 == "build" || $2 == "build" ]]; then
    docker-compose up --build --detach
else
    docker-compose up --detach
fi
