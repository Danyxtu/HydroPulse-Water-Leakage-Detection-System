import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local.development" });

console.log(process.env.PORT);
