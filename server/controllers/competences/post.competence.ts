// cet import ne fonctionne pas à la compilation
// import CompetenceCRUD from "~/server/models/competence.model";
import express from "express";
import CompetenceCRUD from "../../models/competence.model";

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
export default async function postCompetence(req: express.Request, res: express.Response): Promise<void> {
  try {
    const competence = await CompetenceCRUD.add(req.body);
    res.status(200).json(competence);
  } catch (err: any) {
    res.status(404).json(err.message);
  }
}
