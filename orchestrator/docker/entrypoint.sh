#!/bin/bash

echo " scala args are: $@"
echo " aws Region : ${region_code}  -- Cluster  : ${cluster_name}"

# set JAVA_HOME
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
# create the kube config file

aws eks --region ${region_code} update-kubeconfig --name ${cluster_name} --role-arn ${role_arn}
#cat $HOME/.kube/config

# test if it works

kubectl get po

# run the main program
scala -cp "$1" $2