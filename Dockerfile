FROM node:22-alpine AS build
WORKDIR /app

<<<<<<< HEAD
COPY car_wash_management_frontend/dist/ /usr/share/nginx/html/
=======
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/car_wash_management_frontend/dist/ /usr/share/nginx/html/
>>>>>>> 612bd2f (Fix Dockerfile for frontend deployment)

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
