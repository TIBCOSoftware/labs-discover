  
#!/usr/bin/env bash

# Generate code from the Swagger API definition

output_dir=./out

if [ -d ${output_dir} ]; then
    rm -rf ${output_dir}
fi

docker run --rm -v ${PWD}/:/local openapitools/openapi-generator-cli generate -i https://discover.labs.tibcocloud.com/api-docs/swagger.json -g typescript-node -o /local/out --additional-properties=modelPropertyNaming=original

echo 'Copy the generated files to src folder'
cp ./$output_dir/api/*.ts ./src/backend/api/
cp ./$output_dir/model/*.ts ./src/backend/model/
cp ./$output_dir/api.ts ./src/backend/
