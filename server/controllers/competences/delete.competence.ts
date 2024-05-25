// cet import ne fonctionne pas à la compilation
// import CompetenceCRUD from "~/server/models/competence.model";
import express from "express";
import CompetenceCRUD from "../../models/competence.model";

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
export default async function deleteCompetence(req: express.Request, res: express.Response): Promise<void> {
  try {
    await CompetenceCRUD.delete(parseInt(req.params.competenceId));
    res.status(204).json(true);
  } catch (err: any) {
    console.log(err);
    res.status(404).json(err.message);
  }
}
