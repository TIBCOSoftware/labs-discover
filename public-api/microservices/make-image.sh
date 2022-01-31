#!/bin/bash

PS3="Select the micro service: "

select ms in datasets documentation; do
  echo "Start to build image for $ms"
  break;
done


image_name=labs-discover-api-$ms
ws=$(docker ps -a|grep ${image_name}|cut -d' ' -f1|sort|uniq|tr '\012' ' ')
if [ -z ${ws+x} ]
then
  echo "Clean the existing container for image ${image_name}"
  docker stop ${ws}
  docker rm ${ws}
else
  echo "No existing ${image_name} container"
fi

img_ids=$(docker images|grep tibcosoftware/${image_name}|tr -s ' ' ' '|cut -d' ' -f3|sort|uniq|tr '\012' ' ')
docker rmi -f ${img_ids}
docker build --no-cache -t tibcosoftware/${image_name} .
if [[ $? -ne 0 ]] ; then
  echo "Something went wrong. Exiting to avoid further steps to run..."
  exit 1
fi