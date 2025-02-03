FROM node:lts-alpine3.21

# set working directory inside the container
WORKDIR /usr/src/app

# copy package files to working directory
COPY package*.json ./

# install application dependencies
RUN npm install

# copy rest of the files to working directory
COPY . ./

# expose application port
EXPOSE 3000

# start application
CMD ["npm", "run", "dev"]