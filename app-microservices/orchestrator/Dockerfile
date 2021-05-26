FROM ubuntu:20.04

ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en' LC_ALL='en_US.UTF-8'

RUN apt-get update \
    && apt-get install -y --no-install-recommends tzdata curl ca-certificates fontconfig locales \
    && apt-get install -y sudo python3-pip unzip wget less vim \
    && echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen \
    && locale-gen en_US.UTF-8 \
    && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_VERSION jdk-11.0.10+9

RUN set -eux; \
    ARCH="$(dpkg --print-architecture)"; \
    case "${ARCH}" in \
       aarch64|arm64) \
         ESUM='5f9a894bd694f598f2befa4a605169685ac8bcb8ec68d25e587e8db4d2307b74'; \
         BINARY_URL='https://github.com/AdoptOpenJDK/openjdk11-binaries/releases/download/jdk-11.0.10%2B9/OpenJDK11U-jre_aarch64_linux_hotspot_11.0.10_9.tar.gz'; \
         ;; \
       armhf|armv7l) \
         ESUM='2f2da2149c089c84f00b0eda63c31b77c8b51a1c080e18a70ecb5a78ba40d8c6'; \
         BINARY_URL='https://github.com/AdoptOpenJDK/openjdk11-binaries/releases/download/jdk-11.0.10%2B9/OpenJDK11U-jre_arm_linux_hotspot_11.0.10_9.tar.gz'; \
         ;; \
       ppc64el|ppc64le) \
         ESUM='d269b646af32eb41d74b3a5259f634921a063c67642ab5c227142463824b2a6d'; \
         BINARY_URL='https://github.com/AdoptOpenJDK/openjdk11-binaries/releases/download/jdk-11.0.10%2B9/OpenJDK11U-jre_ppc64le_linux_hotspot_11.0.10_9.tar.gz'; \
         ;; \
       s390x) \
         ESUM='2c9ec28b10bf1628b20a157c746988f323e0dcbf1053b616aa6593923e3a70df'; \
         BINARY_URL='https://github.com/AdoptOpenJDK/openjdk11-binaries/releases/download/jdk-11.0.10%2B9/OpenJDK11U-jre_s390x_linux_hotspot_11.0.10_9.tar.gz'; \
         ;; \
       amd64|x86_64) \
         ESUM='25fdcf9427095ac27c8bdfc82096ad2e615693a3f6ea06c700fca7ffb271131a'; \
         BINARY_URL='https://github.com/AdoptOpenJDK/openjdk11-binaries/releases/download/jdk-11.0.10%2B9/OpenJDK11U-jre_x64_linux_hotspot_11.0.10_9.tar.gz'; \
         ;; \
       *) \
         echo "Unsupported arch: ${ARCH}"; \
         exit 1; \
         ;; \
    esac; \
    curl -LfsSo /tmp/openjdk.tar.gz ${BINARY_URL}; \
    echo "${ESUM} */tmp/openjdk.tar.gz" | sha256sum -c -; \
    mkdir -p /opt/java/openjdk; \
    cd /opt/java/openjdk; \
    tar -xf /tmp/openjdk.tar.gz --strip-components=1; \
    rm -rf /tmp/openjdk.tar.gz;


# EKCTL
RUN curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
RUN mv /tmp/eksctl /usr/local/bin

# kubectl
RUN curl -o kubectl https://amazon-eks.s3.us-west-2.amazonaws.com/1.19.6/2021-01-05/bin/linux/amd64/kubectl
RUN chmod +x ./kubectl
RUN mv ./kubectl /usr/local/bin

# iam auth
RUN curl -o aws-iam-authenticator https://amazon-eks.s3.us-west-2.amazonaws.com/1.19.6/2021-01-05/bin/linux/amd64/aws-iam-authenticator
RUN chmod +x ./aws-iam-authenticator
RUN mv ./aws-iam-authenticator /usr/local/bin


ENV JAVA_HOME=/opt/java/openjdk \
    PATH="/usr/local/bin:/opt/java/openjdk/bin:$PATH"