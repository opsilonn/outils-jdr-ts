// cet import ne fonctionne pas à la compilation
// import CompetenceCRUD from "~/server/models/competence.model";
import CompetenceCRUD from "../../models/competence.model";

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
export default async function deleteCompetence(req: any, res: any): Promise<void> {
  try {
    await CompetenceCRUD.delete(parseInt(req.params.competenceId));
    res.status(204).json(true);
  } catch (err: any) {
    console.log(err);
    res.status(404).json(err.message);
  }
}
