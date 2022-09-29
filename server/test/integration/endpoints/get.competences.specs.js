import fs from "fs";
import path from "path";
import { promisify } from "util";
import { expect } from "chai";
import request from "supertest";
import express from "express";
import session from "express-session";
import apiRouter from "../../../routes/routes.js";
const writeFile = promisify(fs.writeFile);
const competencesFile = path.join(__dirname, "../../../data/competences.json");

/**
 * We recreate the express app with our apiRouter to isolate any unwanted middleware
 * Then, we can use a session secret that doesn't need the real server configuration
 */
function createExpress() {
  const app = express();
  app.use(
    session({
      secret: "whatever",
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use("/api/", apiRouter);

  const agent = request.agent(app);
  return agent;
}

async function resetJSON() {
  const content = [
    {
      id: 1,
      name: "Intimidation",
      min: 15,
      range: 20,
      bIsSocial: true,
    },
  ];
  await writeFile(competencesFile, JSON.stringify(content));
}

describe("GET /api/competences", () => {
  before(() => resetJSON());

  it("should return all existing competences", () => {
    const agent = createExpress();
    return agent
      .get("/api/competences")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).to.be.an("array").of.length(1);
        expect(response.body[0].id).to.equal(1);
      });
  });
});
