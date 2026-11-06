FROM nginx:alpine

COPY car_wash_management_frontend/dist/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
