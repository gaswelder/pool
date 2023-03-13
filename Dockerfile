FROM node
WORKDIR /usr/src/myapp
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN yarn build
ENV DATABASE_DIR /usr/src/myapp/data-mounted/
CMD [ "node_modules/.bin/ts-node", "src/backend/backend.ts" ]
