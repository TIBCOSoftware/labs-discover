
#!/usr/bin/env bash

output_dir=./out

if [ -d ${output_dir} ]; then
    rm -rf ${output_dir}
fi

docker run --rm -v "${PWD}:/local" openapitools/openapi-generator-cli generate \
    -i /local/api.yaml \
    -g typescript-angular \
    -o /local/out