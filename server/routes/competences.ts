import { Router } from "express";
import getCompetence from "../controllers/competences/get.competence";
import getCompetences from "../controllers/competences/get.competences";
import postCompetence from "../controllers/competences/post.competence";
import putCompetence from "../controllers/competences/put.competence";
import deleteCompetence from "../controllers/competences/delete.competence";

const competenceRouter = Router();
competenceRouter.get("/competence/:competenceId", getCompetence);
competenceRouter.get("/competences", getCompetences);
competenceRouter.post("/competence", postCompetence);
competenceRouter.put("/competence/:competenceId", putCompetence);
competenceRouter.delete("/competence/:competenceId", deleteCompetence);

export default competenceRouter;
