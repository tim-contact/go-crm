# Build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve static files
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Optional: add nginx.conf for SPA history fallback
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
