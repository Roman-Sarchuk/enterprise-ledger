# Етап 1: Збірка (Build)
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Збираємо продакшн-версію React-додатку
RUN npm run build

# Етап 2: Роздача статики (Serve)
FROM nginx:alpine
# Копіюємо зібрані файли з попереднього етапу в папку Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Відкриваємо 80-й порт
EXPOSE 80
# Запускаємо Nginx
CMD ["nginx", "-g", "daemon off;"]