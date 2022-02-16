FROM node:16-alpine AS frontend
WORKDIR /usr/src/app
COPY ["package.json","yarn.lock","rollup.config.js","tsconfig.json","./"]
RUN yarn install
COPY ./public /usr/src/app/public
COPY ./src /usr/src/app/src
RUN yarn build

FROM nginx:latest
COPY ./nginx /etc/nginx
COPY --from=frontend /usr/src/app/public /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
