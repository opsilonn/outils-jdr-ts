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
    // Read the file
    const competences: Competence[] = await this.getAll();

    // Find the correct instance
    const competence: Competence | undefined = competences.find((_: Competence) => _.id === id);

    // If the instance was not found : throw error
    if (!competence) {
      throw new Error("Instance not found !");
    }

    return competence;
  }

  /**
   * @returns {Promise<Competence[]>}
   */
  static async getAll(): Promise<Competence[]> {
    // Read the file
    const competences: string = await readFile(competencesFile, "utf8");

    // Parse the file as JSON
    return JSON.parse(competences);
  }

  /**
   * @param {Competence} competenceReceived
   * @returns {Promise<Competence>}
   */
  static async add(competenceReceived: Competence): Promise<Competence> {
    // Read the file
    const competences: Competence[] = await this.getAll();

    // Get and set the id
    const maxId = Math.max.apply(
      null,
      competences.map((_) => _.id)
    );
    competenceReceived.id = maxId + 1;

    // Add new Competence
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
    // Read the file
    let competences = await this.getAll();

    // We get the specific index
    const index = competences.findIndex((_) => _.id === id);

    // invalid index : throw Error
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
    // Read the file
    let competences: Competence[] = await this.getAll();

    // get index of the instance to remove
    const index: number = competences.findIndex((_) => _.id === id);

    // invalid index : throw Error
    if (index <= -1) {
      throw new Error("Instance not found !");
    }

    // Remove found Competence
    competences.splice(index, 1);

    // Re-write file
    writeFile(competencesFile, JSON.stringify(competences, null, 2), "utf8");
  }
}
