  
#!/usr/bin/env bash

# Generate code from the Swagger API definition

output_dir=./nimbus

if [ -d ${output_dir} ]; then
    rm -rf ${output_dir}
fi

openapi-generator-cli generate -i ./nimbus.yaml -g typescript-node -o ${output_dir} --additional-properties=modelPropertyNaming=original
rm ./openapitools.json
#echo 'Copy the generated files to src folder'
#cp ./$output_dir/api/*.ts ./src/backend/api/
#cp ./$output_dir/model/*.ts ./src/backend/model/
#cp ./$output_dir/api.ts ./src/backend/
