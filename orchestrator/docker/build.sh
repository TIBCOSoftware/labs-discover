#!/usr/bin/env bash

# do any auth you need.. docker login ... or whatever is needed. good luck anyway !



name="labs-discover-spark-eks"
registry="tibcosoftware"
version="1.0"

docker build \
    --build-arg VCS_REF=$(git rev-parse --short HEAD) \
    --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
    --build-arg VERSION=1.0 \
    -t ${registry}/${name}:${version} . \
&& docker push ${registry}/${name}:${version} \
&& echo "Build & pushed ${registry}/${name}:${version}"