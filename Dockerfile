FROM node:14-alpine
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install && ls
COPY . .
EXPOSE 3001:3001
RUN chown -R node /usr/src/app
USER node
CMD ["node_modules/.bin/electron", "./dist/electron/index.js"]