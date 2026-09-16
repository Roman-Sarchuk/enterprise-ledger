# Етап 1: Збірка (Build)
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Етап 2: Роздача статики (Serve)
FROM nginx:alpine
# Копіюємо зібрані файли
COPY --from=build /app/dist /usr/share/nginx/html

# Копіюємо наш кастомний конфіг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]