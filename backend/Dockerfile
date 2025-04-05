FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g nodemon && npm install

COPY . .

CMD ["npx", "nodemon", "app.js"]
