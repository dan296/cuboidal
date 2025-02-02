# Build Stage
FROM node:18 AS builder
WORKDIR /cuboidal
COPY packages/cuboidal.ui ./
RUN pnpm install && pnpm run build

# Serve with Nginx
FROM nginx:alpine
COPY --from=builder /cuboidal/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
