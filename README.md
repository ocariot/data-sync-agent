
# Data Acquisition Agent Service
[![License][license-image]][license-url] [![Node][node-image]][node-url] [![Travis][travis-image]][travis-url] [![Coverage][coverage-image]][coverage-url] [![Dependencies][dependencies-image]][dependencies-url] [![DependenciesDev][dependencies-dev-image]][dependencies-dev-url] [![Vulnerabilities][known-vulnerabilities-image]][known-vulnerabilities-url] [![Commit][last-commit-image]][last-commit-url] [![Releases][releases-image]][releases-url] [![Contributors][contributors-image]][contributors-url]  [![Swagger][swagger-image]][swagger-url] 

Microservice responsible for data synchronization of FitBit and CVE platform with OCARIoT platform.

**Main features:**
- Automatically sync Fitbit Data
- Publish sync data into a message chanel
 

## Prerequisites
- [Node 8.0.0+](https://nodejs.org/en/download/)
- [MongoDB Server 3.0.0+](https://www.mongodb.com/download-center/community)
- [RabbitMQ 3.7.0+](https://www.rabbitmq.com/download.html)

---

## Set the environment variables
Application settings are defined by environment variables. To define the settings, make a copy of the `.env.example` file, naming for `.env`. After that, open and edit the settings as needed. The following environments variables are available:

| VARIABLE | DESCRIPTION  | DEFAULT |
|-----|-----|-----|
| `NODE_ENV` | Defines the environment in which the application runs. You can set: `test` _(in this environment, the database defined in `MONGODB_URI_TEST` is used and the logs are disabled for better visualization of the test output)_, `development` _(in this environment, all log levels are enabled)_ and `production` _(in this environment, only the warning and error logs are enabled)_. | `development` |
| `PORT_HTTP` | Port used to listen for HTTP requests. Any request received on this port is redirected to the HTTPS port. | `5000` |
| `PORT_HTTPS` | Port used to listen for HTTPS requests. Do not forget to provide the private key and the SSL/TLS certificate. See the topic [generate certificates](#generate-certificates). | `5001` |
| `HOST_WHITELIST` | Access control based on IP addresses. Only allow IP requests in the unlock list. You can define IP or host, for example: `[127.0.0.1, api.ocariot.com]`. To accept requests from any customer, use the character `*`. | `[*]` |
| `SSL_KEY_PATH` | SSL/TLS certificate private key. | `.certs/server.key` |
| `SSL_CERT_PATH` | SSL/TLS certificate. | `.certs/server.crt` |
| `JWT_PRIVATE_KEY_PATH` | Private key used to generate and validate JSON Web Token (JWT). | `.certs/jwt.key` |
| `JWT_PUBLIC_KEY_PATH` | Public key used to generate and validate JSON Web Token (JWT). | `.certs/jwt.key.pub` |
| `ISSUER` | Used to generate the JWT token. Usually it is the name of the platform.  | `ocariot` |
| `ADMIN_USERNAME` | The default user name of type administrator created automatically when the application is initialized and the database has no administrator user.| `admin` |
| `ADMIN_PASSWORD` | The default user password of the administrator type created automatically when the application is initialized and the database has no administrator user.  | `admin` |
| `ENCRYPT_SECRET_KEY` | Secret key used in symmetric encryption applied to username.  | `s3cr3tk3y` |
| `RABBITMQ_URI` | URI containing the parameters for connection to the message channel RabbitMQ. The [URI specifications ](https://www.rabbitmq.com/uri-spec.html) defined by RabbitMQ are accepted. For example: `amqp://user:pass@host:port/vhost`. | `amqp://guest:guest`<br/>`@127.0.0.1:5672/ocariot` |
| `MONGODB_URI` | Database connection URI used if the application is running in development or production environment. The [URI specifications ](https://docs.mongodb.com/manual/reference/connection-string) defined by MongoDB are accepted. For example: `mongodb://user:pass@host:port/database?options`. | `mongodb://127.0.0.1:27017`<br/>`/ocariot-data-sync-agent` |
| `MONGODB_URI_TEST` | Database connection URI used if the application is running in test environment. The [URI specifications ](https://docs.mongodb.com/manual/reference/connection-string) defined by MongoDB are accepted. For example: `mongodb://user:pass@host:port/database?options`. | `mongodb://127.0.0.1:27017`<br/>`/ocariot-data-sync-agent-test` |


## Generate Certificates
For development and testing environments the easiest and fastest way is to generate your own self-signed certificates. These certificates can be used to encrypt data as well as certificates signed by a CA, but users will receive a warning that the certificate is not trusted for their computer or browser. Therefore, self-signed certificates should only be used in non-production environments, that is, development and testing environments. To do this, run the `create-self-signed-certs.sh` script in the root of the repository.
```sh
chmod +x ./create-self-signed-certs.sh
./create-self-signed-certs.sh
```
The following files will be created: `ca.crt`, `jwt.key`, `jwt.key.pub`, `server.crt` and `server.key`.

In production environments its highly recommended to always use valid certificates and provided by a certificate authority (CA). A good option is [Let's Encrypt](https://letsencrypt.org)  which is a CA that provides  free certificates. The service is provided by the Internet Security Research Group (ISRG). The process to obtain the certificate is extremely simple, as it is only required to provide a valid domain and prove control over it. With Let's Encrypt, you do this by using [software](https://certbot.eff.org/) that uses the ACME protocol, which typically runs on your host. If you prefer, you can use the service provided by the [SSL For Free](https://www.sslforfree.com/)  website and follow the walkthrough. The service is free because the certificates are provided by Let's Encrypt, and it makes the process of obtaining the certificates less painful.


## Installation and Execution
#### 1. Install dependencies  
```sh  
npm install    
```
 
#### 2. Build  
Build the project. The build artifacts will be stored in the `dist/` directory.  
```sh  
npm run build    
```

#### 3. Run Server  
```sh  
npm start
```
Build the project and initialize the microservice. **Useful for production/deployment.**  
```sh  
npm run build && npm start
```
## Running the tests

#### All tests  
Run unit testing, integration and coverage by [Mocha](https://mochajs.org/) and [Instanbul](https://istanbul.js.org/).  
```sh  
npm test
```

#### Unit test
```sh  
npm run test:unit
```
  
#### Integration test
```sh  
npm run test:integration
```

#### Coverage  test
```sh  
npm run test:cov
```
Navigate to the `coverage` directory and open the `index.html` file in the browser to see the result. Some statistics are also displayed in the terminal.

### Generating code documentation  
```sh  
npm run build:doc
```
The html documentation will be generated in the /docs directory by [typedoc](https://typedoc.org/).

## Using Docker  
In the Docker Hub, you can find the image of the most recent version of this repository. With this image it is easy to create your own containers.
```sh
docker run ocariot/data-sync-agent
```
This command will download the latest image and create a container with the default settings.

You can also create the container by passing the settings that are desired by the environment variables. The supported settings are the same as those defined in ["Set the environment variables"](#set-the-environment-variables). See the following example:
```sh
docker run --rm \
  -e PORT_HTTP=8080 \
  -e PORT_HTTPS=8081 \
  -e HOST_WHITELIST="[localhost]" \
  -e SSL_KEY_PATH=.certs/server.key \
  -e SSL_CERT_PATH=.certs/server.crt \
  -e JWT_PRIVATE_KEY_PATH=.certs/jwt.key \
  -e JWT_PUBLIC_KEY_PATH=.certs/jwt.key.pub \
  -e ISSUER=ocariot \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=admin123 \
  -e ENCRYPT_SECRET_KEY=s3cr3tk3y \
  -e RABBITMQ_URI="amqp://guest:guest@192.168.0.1:5672/ocariot" \
  -e MONGODB_URI="mongodb://192.168.0.2:27017/ocariot-data-sync-agent" \
  ocariot/data-sync-agent
```
If the MongoDB or RabbitMQ instance is in the host local, add the `--net=host` statement when creating the container, this will cause the docker container to communicate with its local host.
```sh
docker run --rm \
  --net=host \
  -e RABBITMQ_URI="amqp://guest:guest@localhost:5672/ocariot" \
  -e MONGODB_URI="mongodb://localhost:27017/ocariot-data-sync-agent" \
  ocariot/data-sync-agent
```
To generate your own docker image, run the following command:
```sh
docker build -t image_name:tag .
```

[//]: # (These are reference links used in the body of this note.)
[license-image]: https://img.shields.io/badge/license-Apache%202-blue.svg
[license-url]: https://github.com/ocariot/data-sync-agent/blob/master/LICENSE
[node-image]: https://img.shields.io/badge/node-%3E%3D%208.0.0-brightgreen.svg
[node-url]: https://nodejs.org
[travis-image]: https://travis-ci.org/ocariot/data-sync-agent.svg?branch=master
[travis-url]: https://travis-ci.org/ocariot/data-sync-agent
[coverage-image]: https://coveralls.io/repos/github/ocariot/data-sync-agent/badge.svg
[coverage-url]: https://coveralls.io/github/ocariot/data-sync-agent?branch=master
[known-vulnerabilities-image]: https://snyk.io/test/github/ocariot/data-sync-agent/badge.svg
[known-vulnerabilities-url]: https://snyk.io/test/github/ocariot/data-sync-agent
[dependencies-image]: https://david-dm.org/ocariot/data-sync-agent.svg
[dependencies-url]: https://david-dm.org/ocariot/data-sync-agent
[dependencies-dev-image]: https://david-dm.org/ocariot/data-sync-agent/dev-status.svg
[dependencies-dev-url]: https://david-dm.org/ocariot/data-sync-agent?type=dev
[swagger-image]: https://img.shields.io/badge/swagger-v1-brightgreen.svg
[swagger-url]: https://app.swaggerhub.com/apis-docs/nutes.ocariot/data-sync-agent-service/v1
[last-commit-image]: https://img.shields.io/github/last-commit/ocariot/data-sync-agent.svg
[last-commit-url]: https://github.com/ocariot/data-sync-agent/commits
[releases-image]: https://img.shields.io/github/release-date/ocariot/data-sync-agent.svg
[releases-url]: https://github.com/ocariot/data-sync-agent/releases
[contributors-image]: https://img.shields.io/github/contributors/ocariot/data-sync-agent.svg
[contributors-url]: https://github.com/ocariot/data-sync-agent/graphs/contributors


## Pre Installation
1. The microservice runs on HTTPS, so it is necessary to generate the private key and certificate. In the development and testing environment, you must use a self-signed certificate. You can do this as you wish, if you prefer, check the following links that will help you create the necessary files (file.key and file.crt).
    - [Creating a Self-Signed SSL Certificate](https://pages.github.com/https://devcenter.heroku.com/articles/ssl-certificate-self).
    - [Self-Signed Certificate Generator](http://www.selfsignedcertificate.com/).
    
    **NOTE:** For the production environment, do not use self-signed certificates, but certificates provided by certification authorities.

2. Create a `cert` directory in the project root and save the files generated in step 1 to this directory, the directory will already be in .gitignore. Therefore, it will not be shared. 
   
3. Make a copy of the ".env.example" file, naming to .env. After that, open and edit the settings as needed.

## Installation and Development server
Requires [Node.js](https://nodejs.org/) v6+ and [MongoDb](https://www.mongodb.com) to run.
Install the dependencies, start the local MongoDb, and start the server.
```sh
$ npm install
$ npm run start:dev
```
Navigate to `http://127.0.0.1:3000`.

## Build
- Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Run Server
- Run `npm start` to run the project in production mode.
- Run `npm run start:dev` to run the project in development mode. Code changes are automatically identified and rebuild is performed.
- Run `npm run build && npm start` Perform the build and initialize the microservice. **Useful for production/deployment.**

## Running unit tests
- Run `npm run test:unit` to run unit tests by [Mocha](https://mochajs.org/).

## Running integration tests
- Run `mongod`
- Run `npm run test:integration` to run integration tests by [Mocha](https://mochajs.org/).

## Running test coverage
- Run `npm run test:cov` to run code coverage tests by [Instanbul](https://istanbul.js.org/).

## Running all tests
- Run `mongod`
- Run `npm run test` to run unit testing, integration and coverage by [Mocha](https://mochajs.org/) and [Instanbul](https://istanbul.js.org/).

## Generating code documentation
- Run `npm run build:doc` the html documentation will be generated in the /docs directory by [typedoc](https://typedoc.org/).
