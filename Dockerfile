FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG VITE_API_URL=https://ai-tradingbot-backend.vcl4xengine.com
ARG VITE_WS_URL=wss://ai-tradingbot-backend.vcl4xengine.com
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN chmod +x node_modules/.bin/vite && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Fix React Router - serve index.html for all routes
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
