import * as dotenv from "dotenv";
dotenv.config();
import { Application } from "express";

import cors from "cors";
import { json, urlencoded } from "body-parser";
import cookieSession from "cookie-session";
import mongoose from "mongoose";
import { currentUser, errorHandler } from "@shoppingapp/common";
import { authRouters } from "./auth/auth.routers";
import { sellerRouters } from "./seller/seller.routers";

export class AppModule {
  constructor(public app: Application) {
    app.set("trust-proxy", true);

    app.use(
      cors({
        origin: "*",
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );

    app.use(urlencoded({ extended: false }));
    app.use(json());
    app.use(
      cookieSession({
        signed: false,
        secure: false,
      })
    );

    Object.setPrototypeOf(this, AppModule.prototype);
  }

  async start() {
    if (!process.env.MONGO_URI) {
      throw new Error("mongo_uri must be defined");
    }
    if (!process.env.JWT_KEY) {
      throw new Error("Jwt_key must be defined");
    }

    try {
      mongoose.set("strictQuery", false);
      await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
      throw new Error("database connection error");
    }
    // All routes need to use this currentUser router
    this.app.use(currentUser(process.env.JWT_KEY!));
    this.app.use(authRouters);
    this.app.use(sellerRouters);
    this.app.use(errorHandler);

    this.app.listen(8080, () =>
      console.log("Server is listening on port 8080")
    );
  }
}
