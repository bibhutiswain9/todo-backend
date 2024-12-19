import morgan from "morgan";
import path from "path";
import helmet from "helmet";
import express, { Request, Response, NextFunction } from "express";
import logger from "jet-logger";
import cors from "cors";
import "express-async-errors";
const resHelper = require("./utilities/res_helper");

import BaseRouter from "@src/routes";

import Paths from "@src/routes/common/Paths";
import Env from "@src/common/Env";
import HttpStatusCodes from "@src/common/HttpStatusCodes";
import { RouteError } from "@src/common/route-errors";
import { NodeEnvs } from "@src/common/constants";

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://zjohhgwoerbuopoennxy.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqb2hoZ3dvZXJidW9wb2Vubnh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyODk1NjQsImV4cCI6MjA0OTg2NTU2NH0.3EzsCAtCGp6BYrkcu6IlOjdd8j9GlvLAR5kpcGekRBQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const corsOptions = {
  origin: [
    "http://54.165.215.89:3000", // Example: Allow frontend running locally
    "https://nextjs-todo-eight.vercel.app", // Example: Your production frontend domain
  ],
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // If you need to send cookies/auth headers
};

// **** Variables **** //

const app = express();
app.use(cors(corsOptions));

// **** Setup **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Show routes called in console during development
if (Env.NodeEnv === NodeEnvs.Dev.valueOf()) {
  app.use(morgan("dev"));
}

// Security
if (Env.NodeEnv === NodeEnvs.Production.valueOf()) {
  app.use(helmet());
}

// Add APIs, must be after middleware
app.use(Paths.Base, BaseRouter);

// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (Env.NodeEnv !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
    res.status(status).json({ error: err.message });
  }
  return next(err);
});

// **** Front-End Content **** //

// Set views directory (html)
const viewsDir = path.join(__dirname, "views");
app.set("views", viewsDir);

// Set static directory (js and css).
const staticDir = path.join(__dirname, "public");
app.use(express.static(staticDir));

// Nav to users pg by default
app.get("/", (_: Request, res: Response) => {
  return res.redirect("/users");
});

// Redirect to login if not logged in.
app.get("/users", (_: Request, res: Response) => {
  return res.sendFile("users.html", { root: viewsDir });
});

app.get("/getAllTodo", (req, res) => {
  try {
    supabase
      .from("todo")
      .select("*")
      .then((result: any) => {
        resHelper.onSucess("Data fetched", result.data, res);
      });
  } catch (error) {
    resHelper.onError("Something wents wrong", res);
  }
});

app.post("/createTodo", (req, res) => {
  const { id, title, status } = req.body;
  try {
    supabase
      .from("todo")
      .insert([{ id: id, title: title, status: status }])
      .then((result: any) => {
        console.log("-->result", result);
        resHelper.onSucess("Add successfully", result, res);
      });
  } catch (err) {
    resHelper.onError("Something wents wrong", res);
  }
});

app.post("/deleteTodo", (req, res) => {
  const { id } = req.body;
  try {
    supabase
      .from("todo")
      .delete()
      .eq("id", id)
      .then((result: any) => {
        resHelper.onSucess("Data deleted", [], res);
      });
  } catch (error) {
    resHelper.onError("Something wents wrong", res);
  }
});

// **** Export default **** //

export default app;
