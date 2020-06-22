FROM node:12-alpine
RUN apk --no-cache add bash curl grep

# Create app directory
RUN mkdir -p /usr/src/ds
WORKDIR /usr/src/ds

# Install app dependencies
COPY package.json /usr/src/ds/
RUN npm install

# Copy app source
COPY . /usr/src/ds

# Build app
RUN npm run build

EXPOSE 5000
EXPOSE 5001

CMD ["npm", "start"]
