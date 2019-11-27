
# Data Sync Agent Service
[![License][license-image]][license-url] [![Node][node-image]][node-url] [![Travis][travis-image]][travis-url] [![Coverage][coverage-image]][coverage-url] [![Dependencies][dependencies-image]][dependencies-url] [![DependenciesDev][dependencies-dev-image]][dependencies-dev-url] [![Vulnerabilities][known-vulnerabilities-image]][known-vulnerabilities-url] [![Commit][last-commit-image]][last-commit-url] [![Releases][releases-image]][releases-url] [![Contributors][contributors-image]][contributors-url]  [![Swagger][swagger-image]][swagger-url] 

Microservice responsible for data synchronization of FitBit and CVE platform with OCARIoT platform.

**Main features:**
- Fitbit access token management;
- Automatically sync Fitbit data;
- Publish sync data to a message channel;
- Fitbit access token revocation;
- Subscriber to resources provided by Fitbit.
 
## Prerequisites
- [Node 8.0.0+](https://nodejs.org/en/download/)
- [MongoDB Server 3.0.0+](https://www.mongodb.com/download-center/community)
- [Redis Server 5.0.0+](https://redis.io/download)
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
| `MONGODB_URI` | Database connection URI used if the application is running in development or production environment. The [URI specifications ](https://docs.mongodb.com/manual/reference/connection-string) defined by MongoDB are accepted. For example: `mongodb://user:pass@host:port/database?options` | `mongodb://127.0.0.1:27017`<br/>`/ocariot-ds-agent` |
| `MONGODB_URI_TEST` | Database connection URI used if the application is running in test environment. The [URI specifications ](https://docs.mongodb.com/manual/reference/connection-string) defined by MongoDB are accepted. For example: `mongodb://user:pass@host:port/database?options` | `mongodb://127.0.0.1:27017`<br/>`/ocariot-ds-agent-test` |
| `REDIS_URI` | Redis database connection URI. Using for sync jobs. | `redis://127.0.0.1:6379` |
| `RABBITMQ_URI` | URI containing the parameters for connection to the message channel RabbitMQ. The [URI specifications ](https://www.rabbitmq.com/uri-spec.html) defined by RabbitMQ are accepted. For example: `amqp://user:pass@host:port` | `amqp://guest:guest`<br/>`@127.0.0.1:5672` |
| `RABBITMQ_CA_PATH` | RabbitMQ CA file location. Must always be provided when using `amqps` protocol. | `.certs/rabbitmqca.crt` |
| `FITBIT_CLIENT_ID` | Client Id for Fitbit Application resposible to manage user data. | `CIENT_ID_HERE` |
| `FITBIT_CLIENT_SECRET` | Client Secret for Fitbit Application resposible to manage user data. | `CIENT_SECRET_HERE` |
| `FITBIT_CLIENT_SUBSCRIBER` | Client Subscriber code for automatically get notification from new sync data. | `CLIENT_SUBSCRIBER_HERE` |
| `FITBIT_SUBSCRIBER_ID` | Customer Subscriber ID, used to manage the subscriber who will receive notification of a user resource. | `FITBIT_SUBSCRIBER_ID` |
| `EXPRESSION_AUTO_SYNC` | Defines how often the application will automatically sync user data in the background according to the crontab expression. | `0 0 * * 0` |

## Generate Certificates
For development and testing environments the easiest and fastest way is to generate your own self-signed certificates. These certificates can be used to encrypt data as well as certificates signed by a CA, but users will receive a warning that the certificate is not trusted for their computer or browser. Therefore, self-signed certificates should only be used in non-production environments, that is, development and testing environments. To do this, run the `create-self-signed-certs.sh` script in the root of the repository.
```sh
chmod +x ./create-self-signed-certs.sh
./create-self-signed-certs.sh
```
The following files will be created: `ca.crt`, `server.crt` and `server.key`.

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
docker run ocariot/ds-agent
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
  -e RABBITMQ_URI="amqp://guest:guest@192.168.0.1:5672" \
  -e MONGODB_URI="mongodb://192.168.0.2:27017/ocariot-ds-agent" \
  -e REDIS_URI="redis://127.0.0.1:6379" \
  -e FITBIT_CLIENT_ID="YOUR_FITBIT_CLIENT_ID" \
  -e FITBIT_CLIENT_SECRET="YOUR_FITBIT_CLIENT_SECRET" \
  -e FITBIT_CLIENT_SUBSCRIBER="YOUR_FITBIT_CLIENT_SUBSCRIBER" \
  -e FITBIT_SUBSCRIBER_ID="SUBSCRIBER_ID_HERE" \
  -e EXPRESSION_AUTO_SYNC="0 0 * * 0" \
  ocariot/ds-agent
```
If the MongoDB or RabbitMQ instance is in the host local, add the `--net=host` statement when creating the container, this will cause the docker container to communicate with its local host.
```sh
docker run --rm \
  --net=host \
  -e RABBITMQ_URI="amqp://guest:guest@localhost:5672" \
  -e MONGODB_URI="mongodb://localhost:27017/ocariot-ds-agent" \
  -e REDIS_URI="redis://127.0.0.1:6379" \
  -e FITBIT_CLIENT_ID="YOUR_FITBIT_CLIENT_ID" \
  -e FITBIT_CLIENT_SECRET="YOUR_FITBIT_CLIENT_SECRET" \
  -e FITBIT_CLIENT_SUBSCRIBER="YOUR_FITBIT_CLIENT_SUBSCRIBER" \
  -e FITBIT_SUBSCRIBER_ID="SUBSCRIBER_ID_HERE" \
  -e EXPRESSION_AUTO_SYNC="0 0 * * 0" \
  ocariot/ds-agent
```
To generate your own docker image, run the following command:
```sh
docker build -t image_name:tag .
```
-------

### Fitbit Client Errors Published in Message Bus
This microservice has a particular way of managing errors from the Fitbit Client, which is responsible for communicating with the Fitbit Server to interact with platform user data. When an error is generated by the client, it is published to the message channel with the following structure:
```
{
    "child_id": "5a62be07de34500146d9c544",
    "error": {
        "code": 1581, 
        "message": "The message is here", 
        "description": "The description is here"   
    }
}
```
The `code` parameter is an internal implementation of the API, which serves to map the generated errors. The following table illustrates the mapping of these errors as implemented in the API:

| code | type | reference | message  | description |
|-----|-----|-----|-----|-----|
|1011| expired_token | Expired Access Token | Access token expired. | The access token has been expired and needs to be refreshed. | 
|1012| invalid_token | Invalid Access Token | Access token invalid. | The access token is invalid. Please make a new Fitbit Auth Data request and try again. | 
|1021| invalid_grant | Invalid Refresh Token | Refresh token invalid. | The refresh token is invalid. Please make a new Fitbit Auth Data request and try again. | 
|1401| invalid_client | Invalid Client Credentials | Invalid Fitbit Client data.| The Fitbit Client credentials are invalid. The operation cannot be performed. | 
|1429| system | Too Many Requests | Data request limit for user has expired.  | Please wait a minimum of one hour and try make the operation again. | 
|1500| any | Generic Error | The message from error. | The description from error. | 

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
[swagger-url]: https://app.swaggerhub.com/apis-docs/nutes.ocariot/data-sync-agent/v1
[last-commit-image]: https://img.shields.io/github/last-commit/ocariot/data-sync-agent.svg
[last-commit-url]: https://github.com/ocariot/data-sync-agent/commits
[releases-image]: https://img.shields.io/github/release-date/ocariot/data-sync-agent.svg
[releases-url]: https://github.com/ocariot/data-sync-agent/releases
[contributors-image]: https://img.shields.io/github/contributors/ocariot/data-sync-agent.svg
[contributors-url]: https://github.com/ocariot/data-sync-agent/graphs/contributors
