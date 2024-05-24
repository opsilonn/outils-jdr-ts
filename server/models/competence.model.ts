import fs from "fs";
import path from "path";
import { promisify } from "util";
import Competence from "../../models/models/competence";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const competencesFile = path.join(__dirname, "../data/competences.json");

export default class CompetenceCRUD {
  /**
   * @param {number} id
   * @returns {Promise<Competence>}
   */
  static async get(id: number): Promise<Competence> {
    const competences: Competence[] = await this.getAll();
    const competence: Competence | undefined = competences.find((_: Competence) => _.id === id);
    if (!competence) {
      throw new Error("Instance not found !");
    }

    return competence;
  }

  /**
   * @returns {Promise<Competence[]>}
   */
  static async getAll(): Promise<Competence[]> {
    const competences: string = await readFile(competencesFile, "utf8");
    return JSON.parse(competences);
  }

  /**
   * @param {Competence} competenceReceived
   * @returns {Promise<Competence>}
   */
  static async add(competenceReceived: Competence): Promise<Competence> {
    const competences: Competence[] = await this.getAll();

    const maxId = Math.max.apply(null, competences.map((_) => _.id));
    competenceReceived.id = maxId + 1;

    competences.push(competenceReceived);
    writeFile(competencesFile, JSON.stringify(competences, null, 2), "utf8");

    return competenceReceived;
  }

  /**
   *
   * @param {number} id
   * @param {Competence} competenceReceived
   * @returns {Promise<Competence>}
   */
  static async update(id: number, competenceReceived: Competence): Promise<Competence> {
    let competences = await this.getAll();

    const index = competences.findIndex((_) => _.id === id);
    if (index <= -1) {
      throw new Error("Instance not found !");
    }

    competenceReceived.id = id;
    competences[index] = competenceReceived;
    writeFile(competencesFile, JSON.stringify(competences, null, 2), "utf8");

    return competenceReceived;
  }

  /**
   * @param {number} id
   * @returns {Promise<Competence>}
   */
  static async delete(id: number) {
    let competences: Competence[] = await this.getAll();

    const index: number = competences.findIndex((_) => _.id === id);
    if (index <= -1) {
      throw new Error("Instance not found !");
    }

    competences.splice(index, 1);
    writeFile(competencesFile, JSON.stringify(competences, null, 2), "utf8");
  }
}
