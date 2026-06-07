# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_GOOGLE_MAPS_KEY
ENV VITE_GOOGLE_MAPS_KEY=$VITE_GOOGLE_MAPS_KEY
RUN npm run build

# Run stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Por defecto escucha en 80 y apunta al backend de compose
ENV PORT=80
ENV BACKEND_URL=http://chukeles-backend:8080

EXPOSE 80

CMD cp /etc/nginx/conf.d/default.conf.template /etc/nginx/conf.d/default.conf && \
    sed -i -e 's/listen 80;/listen '"$PORT"';/g' -e 's|BACKEND_URL_PLACEHOLDER|'"$BACKEND_URL"'|g' /etc/nginx/conf.d/default.conf && \
    RESOLVER=$(awk 'BEGIN{ORS=" "} $1=="nameserver" {print $2}' /etc/resolv.conf) && \
    sed -i "s/server {/server {\n    resolver $RESOLVER valid=30s ipv6=off;/g" /etc/nginx/conf.d/default.conf && \
    nginx -g 'daemon off;'
