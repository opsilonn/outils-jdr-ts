import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import validator from "validator";
import PlaylistItemBack from "~/models/models/playlist-item-back";
import AudioItem from "../../models/models/audio-item";

const AUDIO_FOLDER_PATH = "./static/audio";

export default class AudioCRUD {

  static audiosDatabase: AudioItem[]= [];

  /**
   * @returns {Promise<[]>}
   */
  public static async getAll(): Promise<{ audioFolder: PlaylistItemBack[], audiosDatabase: AudioItem[] }> {
    this.audiosDatabase = [];
    
    const audioFolder: PlaylistItemBack[] = await this.readFolder(AUDIO_FOLDER_PATH);

    return {
      audioFolder: audioFolder,
      audiosDatabase: this.audiosDatabase
    };
  }

  /**
   * Reads a folder's content (subfolders and files) recursively
   * @param {*} path Path of the current folder
   * @returns An object containing all its content
   */
  private static readFolder(path: string): PlaylistItemBack[] {
    const folder: PlaylistItemBack[] = [];

    try {
      // We get all the files
      const filesName = fs.readdirSync(path);

      // We first add the folders
      filesName
        .filter((fileName) => !fileName.includes("."))
        .forEach((fileName) => folder.push(this.getFolder(fileName, path)));

      // We then add the files
      filesName
        .filter((fileName) => fileName.includes("."))
        .forEach((fileName) => folder.push(this.getItem(fileName, path)));
    } catch (err: any) {
      console.log(err);
    }

    return folder;
  }

  /**
   *
   * @param {string} fileName
   * @param {string} path
   * @returns
   */
  private static getItem(fileName: string, path: string): PlaylistItemBack {
    // On déclare nos variables
    let id: string;
    let name: string;
    let fullPath: string;
    const fileId = fileName.substring(fileName.lastIndexOf(" ") + 1, fileName.lastIndexOf("."));

    if (validator.isUUID(fileId)) {
      id = fileId;
      name = fileName.substring(0, fileName.lastIndexOf(" "));
      fullPath = `${path}/${fileName}`;
    } else {
      id = uuidv4();
      name = fileName.substring(0, fileName.lastIndexOf("."));
      fullPath = `${path.replace('./', '')}/${name} ${id}` + fileName.substring(fileName.lastIndexOf("."), fileName.length);
      fs.renameSync(`${path}/${fileName}`, fullPath);
    }

    // On construit l'audio
    const item: PlaylistItemBack = {
      children: [],
      id: null,
      idAudio: id,
      name: name,
      path: fullPath.replace("./static", ""),
      surname: "",
    } as PlaylistItemBack;

    // On ajoute chaque musique à la BDD
    this.audiosDatabase.push(new AudioItem(id, name, fullPath.replace("./static", "")));

    return item;
  }

  /**
   *
   * @param {string} fileName
   * @param {string} path
   * @returns
   */
  private static getFolder(fileName: string, path: string): PlaylistItemBack {
    // On déclare nos variables
    let id: string;
    let name: string;
    let fullPath: string;
    const fileId = fileName.substring(fileName.lastIndexOf(" ") + 1, fileName.length);

    if (validator.isUUID(fileId)) {
      id = fileId;
      name = fileName.substring(0, fileName.lastIndexOf(" "));
      fullPath = `${path}/${fileName}`;
    } else {
      id = uuidv4();
      name = fileName;
      fullPath = `${path.replace('./', '')}/${name} ${id}`;
      fs.renameSync(`${path}/${fileName}`, fullPath);
    }

    // On construit le dossier
    const item: PlaylistItemBack = {
      children: this.readFolder(fullPath),
      id: null,
      idAudio: id,
      name: name,
      path: fullPath.replace("./static", ""),
      surname: "",
    } as PlaylistItemBack;

    return item;
  }
}
