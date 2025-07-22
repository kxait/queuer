FROM node:24-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci --omit=dev

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
