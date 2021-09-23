#!/usr/bin/env bash

# do any auth you need.. docker login ... or whatever is needed. good luck anyway !



name="labs-discover-spark-history"
registry="public.ecr.aws/tibcolabs"
version="3.1.2"

docker build \
    --build-arg VCS_REF=$(git rev-parse --short HEAD) \
    --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
    --build-arg VERSION=0.1 \
    -t ${registry}/${name}:${version} . \
&& docker push ${registry}/${name}:${version} \
&& echo "Build & pushed ${registry}/${name}:${version}"
