FROM node:14-stretch
WORKDIR /usr/src/app
COPY entrypoint.sh /
RUN npm install -g nodemon

ENTRYPOINT /entrypoint.sh

#COPY src /usr/src/app
#RUN npm install
