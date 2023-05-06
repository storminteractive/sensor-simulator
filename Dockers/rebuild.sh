#git clone https://github.com/storminteractive/restart-backend src/
#git clone git@github.com:storminteractive/restart-backend.git src/
#git --git-dir $(pwd)/../.git --work-tree $(pwd)/../ pull

CONTAINER_NAME=stormcrm-dev
IMAGE_NAME=storminteractive/stormcrm:1.0

export $(cat ../.env | xargs)
if [ -z "$VIRTUAL_HOST" ]
then
    echo "No VIRTUAL_HOST set, using default $CONTAINER_NAME.stormint.com"
    VIRTUAL_HOST=$CONTAINER_NAME.stormint.com
else
    echo "Using VIRTUAL_HOST from .env - $VIRTUAL_HOST"
fi

docker kill $CONTAINER_NAME
docker rm $CONTAINER_NAME
docker build -t $IMAGE_NAME .

docker run -it --name $CONTAINER_NAME --restart=unless-stopped \
-e VIRTUAL_HOST=$VIRTUAL_HOST --expose 3000 -v $(pwd)/../:/usr/src/app -p 3000:3000 -d $IMAGE_NAME

#-e VIRTUAL_HOST=$VIRTUAL_HOST -v $(pwd)/../:/usr/src/app -p 5000:5000 -d $IMAGE_NAME

#--log-driver=syslog --log-opt syslog-address=udp://dev.stormint.com:514 --log-opt tag=$CONTAINER_NAME \
#docker run -it --network net1 --name $CONTAINER_NAME -v $(pwd)/../../restart-backend:/usr/src/app -p 2002:8080 -d $IMAGE_NAME

sleep 1
docker ps

docker logs $CONTAINER_NAME -f
