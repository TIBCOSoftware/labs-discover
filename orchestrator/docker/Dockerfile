############# basic image with kubectl, eksctl, aws cli and openjdk
FROM  multiarch/ubuntu-core:x86_64-bionic

ENV SCALA_VERSION 2.12.11
ENV SPARK_VERSION 3.0.1

ARG VERSION
ARG VCS_REF
ARG BUILD_DATE

# Adhere to opencontainers image spec https://github.com/opencontainers/image-spec/blob/master/annotations.md
LABEL org.opencontainers.image.title="tibcolabs-spark-orchestrator" \
      org.opencontainers.image.created=${BUILD_DATE} \
      org.opencontainers.image.description="base image for Scala  k8s orchestrator that need to run on kubernetes via the spark-operator" \
      org.opencontainers.image.source="https://github.com/TIBCOSoftware/labs-discover" \
      org.opencontainers.image.documentation="https://tibcosoftware.github.io/labs-discover/" \
      org.opencontainers.image.revison=${VCS_REF} \
      org.opencontainers.image.vendor="TIBCO" \
      org.opencontainers.image.version=${VERSION} \
      org.opencontainers.image.authors="Florent Cenedese <fcenedes@tibco.com>" \
      version.scala=${SCALA_VERSION} \
      version.spark=${SPARK_VERSION} 


#basics
RUN apt-get update
RUN apt-get install curl unzip tar postgresql-client -y

# AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install
RUN rm -rf awscliv2.zip

# EKCTL
RUN curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
RUN mv /tmp/eksctl /usr/local/bin

# kubectl
RUN curl -o kubectl https://amazon-eks.s3.us-west-2.amazonaws.com/1.16.8/2020-04-16/bin/linux/amd64/kubectl
RUN chmod +x ./kubectl
RUN mv ./kubectl /usr/local/bin

# iam auth
RUN curl -o aws-iam-authenticator https://amazon-eks.s3.us-west-2.amazonaws.com/1.16.8/2020-04-16/bin/linux/amd64/aws-iam-authenticator
RUN chmod +x ./aws-iam-authenticator
RUN mv ./aws-iam-authenticator /usr/local/bin

# java....

RUN apt-get install openjdk-11-jdk -y

# scala...

RUN curl -o scala-${SCALA_VERSION}.deb https://downloads.lightbend.com/scala/${SCALA_VERSION}/scala-${SCALA_VERSION}.deb

RUN dpkg -i scala-${SCALA_VERSION}.deb && rm -f *.deb

# entrypoint..
RUN mkdir -p /opt/orchestrator

COPY ./entrypoint.sh /opt/orchestrator
RUN chmod a+x /opt/orchestrator/entrypoint.sh


ENTRYPOINT ["/opt/orchestrator/entrypoint.sh"]