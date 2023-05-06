#!/bin/bash
git --git-dir $(pwd)/../.git --work-tree $(pwd)/../ pull

CONTAINER_NAME=sensor-simulator
IMAGE_NAME=storminteractive/sensor-simulator:1.0

#export $(cat ../.env | xargs)
if [ -z "$VIRTUAL_HOST" ]
then
    echo "No VIRTUAL_HOST set, using default sensorsimulator.com"
    VIRTUAL_HOST=sensorsimulator.com
else
    echo "Using VIRTUAL_HOST from .env - $VIRTUAL_HOST"
fi

docker kill $CONTAINER_NAME
docker rm $CONTAINER_NAME
docker build -t $IMAGE_NAME .

docker run -it --name $CONTAINER_NAME --restart=unless-stopped \
--expose 3001 -e VIRTUAL_HOST=$VIRTUAL_HOST -v $(pwd)/../:/usr/src/app -d $IMAGE_NAME 
#-e VIRTUAL_HOST=$VIRTUAL_HOST -v $(pwd)/../:/usr/src/app -p 3000:3000 -d $IMAGE_NAME

#docker run -it --network net1 --name $CONTAINER_NAME -v $(pwd)/../../restart-backend:/usr/src/app -p 2002:8080 -d $IMAGE_NAME

sleep 1
docker ps

docker logs $CONTAINER_NAME -f
