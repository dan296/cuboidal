FROM node:18
WORKDIR /cuboidal
COPY packages/cuboidal.api ./
RUN pnpm install
CMD ["pnpm", "start"]
EXPOSE 4000
