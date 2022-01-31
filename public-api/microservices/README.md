# labs-processmining-public-api

LABS Project Discover API's

## Get Started with Development
Developers need at least the latest NPM, [Lens](https://k8slens.dev/) and Discover $HOME/.kube/config

### using Cloud Discover Redis locally
You can use the remove Cloud Discover Redis locally, to get the proxy started use LENS

- Cluster arn:aws:eks:eu-west-1:404217825284:cluster/k8s
- Workload / Pods
- Namespace: spark-operators
- redis-<someid> ... under ports select 'tcp-redis:6379/TCP' ... the now opening URL contains the local Redis Proxy port
### Generators
To generate new API Interfaces https://github.com/OpenAPITools/openapi-generator-cli 

### One time Repo prep. (Mac & Win)

```
npm install
npm i -g nodemon
npm i -g pino-pretty
npm i -g @openapitools/openapi-generator-cli
```

### Dev Env prep.
#### Mac

```
export REDIS_PORT=55979      ## redis proxy post from LENS
export REDIS_HOST=127.0.0.1
export LIVEAPPS=https://eu.liveapps.cloud.tibco.com
export NIMBUS=https://eu.nimbus.cloud.tibco.com
export LOGLEVEL=debug

cd microservices
npm run dev2
```

#### Win

```
set REDIS_PORT=55979        ## redis proxy post from LENS
set REDIS_HOST=127.0.0.1
set LIVEAPPS=https://eu.liveapps.cloud.tibco.com
set NIMBUS=https://eu.nimbus.cloud.tibco.com
set LOGLEVEL=debug

cd microservices
npm run devwin
```

### run swagger UI

open 'http://localhost:8080/swagger'

> alternatively use Postman.

### create Docker Image
just an example

#### Login 
log in to AWS
```
aws ecr-public get-login-password --region us-east-1 --profile oocto | docker login --username AWS --password-stdin public.ecr.aws/tibcolabs
```

#### Build
local build on Docker
```
docker rmi -f labs-discover-api-documentation
docker build --no-cache -t tibcosoftware/labs-discover-api-documentation .
```

#### Tagging
tag local Docker Image
```
docker tag tibcosoftware/labs-discover-api-documentation:latest public.ecr.aws/tibcolabs/labs-discover-api-documentation:v0.0.1
```

#### Pushing
push local Docker Image to Cloud K8 Cluster
```
docker push public.ecr.aws/tibcolabs/labs-discover-api-documentation:latest
```
