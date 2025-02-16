import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerOptions from "./swaggerConfig";

const specs = swaggerJsdoc(swaggerOptions);

export { swaggerUi, specs };