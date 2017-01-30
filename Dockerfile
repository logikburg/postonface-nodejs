FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# $PORT is set by Heroku
EXPOSE 8080

# Run the app.  CMD is required to run on Heroku
CMD node processor
