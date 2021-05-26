
#!/usr/bin/env bash

# output_dir=./out

# if [ -d ${output_dir} ]; then
#     rm -rf ${output_dir}
# fi

# docker run --rm -v "${PWD}/local:/local" openapitools/openapi-generator-cli generate \
#     -i /local/api.json \
#     -g typescript-angular \
#     -o /local/out


# Generate code from the Swagger API definition

working_dir=./swaggerui/docs
output_dir=${working_dir}/out

if [ -d ${output_dir} ]; then
    rm -rf ${output_dir}
fi

docker run --rm -v ${PWD}/${working_dir}:/local \
    openapitools/openapi-generator-cli generate \
    -i /local/discover.json \
    -g typescript-angular \
    -o /local/out \
    --generate-alias-as-model

cp ${output_dir}/model/* src/app/model
cp ${output_dir}/api/* src/app/api

cp ${output_dir}/api.module.ts src/app/
cp ${output_dir}/configuration.ts src/app/
cp ${output_dir}/encoder.ts src/app/
cp ${output_dir}/variables.ts src/app/

if [ -d ${output_dir} ]; then
    rm -rf ${output_dir}
fi

# ng lint --fix