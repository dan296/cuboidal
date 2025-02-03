import { Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cuboidal API",
      version: "1.0.0",
      description: "API documentation for the Cuboidal application",
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // Path to the API docs
};

export default options;