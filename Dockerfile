FROM node:14

WORKDIR /backoffice

COPY package.json /tmp/package.json

RUN cd /tmp && npm install

RUN cp -a /tmp/node_modules /backoffice

COPY . .

RUN npm run build

RUN npm rebuild

EXPOSE 3001

CMD ["npm", "run", "start"]