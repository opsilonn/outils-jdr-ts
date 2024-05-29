import fs from "fs";
import path from "path";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import AudioItem from "../../models/models/audio-item";
import Playlist from "../../models/models/playlist";
import PlaylistItemBack from "../../models/models/playlist-item-back";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const PATH_FILE = path.join(__dirname, "../data/playlists.json");
const PATH_FILE_SAVE = path.join(__dirname, "../data/playlists_save.json");

export default class PlaylistCRUD {
  /**
   * @param {string} id
   * @returns {Promise<Playlist>}
   */
  public static async get(id: string): Promise<Playlist> {
    const playlists: Playlist[] = await this.getAll();

    const playlist: Playlist = playlists.find((p: Playlist) => p.id === id);
    if (!playlist) {
      throw new Error("Playlist not found !");
    }

    return playlist;
  }

  /**
   * @param {string} id
   * @returns {Promise<Playlist>}
   */
  public static async getSaved(id: string): Promise<Playlist> {
    const playlists: Playlist[] = await this.getAll(PATH_FILE_SAVE);

    let playlist: Playlist = playlists.find((p: Playlist) => p.id === id);
    if (!playlist) {
      playlist = await this.get(id);
      if (!playlist) {
        throw new Error("Playlist not found !");
      }
    }

    return playlist;
  }

  /**
   * @returns {Promise<Playlist[]>}
   */
  public static async getAll(path: string = PATH_FILE):Promise<Playlist[]> {
    if (!fs.existsSync(path)) {
      writeFile(path, JSON.stringify([], null, 2), "utf8");
      return [];
    }

    const playlistsAsString: string = await readFile(path, "utf8");

    return JSON.parse(playlistsAsString);
  }

  /**
   * @param {PlaylistCRUD} playlistReceived
   * @returns {Promise<Playlist>}
   */
  public static async add(playlistReceived: Playlist): Promise<Playlist> {
    const playlist: Playlist = {
      id: uuidv4(),
      name: playlistReceived.name,
      rootFolder: [],
      total: 0
    };

    let playlists: Playlist[] = await this.getAll();
    playlists.push(playlist);
    writeFile(PATH_FILE, JSON.stringify(playlists, null, 2), "utf8");

    return playlist;
  }

  /**
   *
   * @param {string} id
   * @param {PlaylistCRUD} playlistReceived
   * @returns {Promise<Playlist>}
   */
  public static async update(id: string, playlistReceived: Playlist): Promise<Playlist> {
    let playlists: Playlist[] = await this.getAll();

    const playlist: Playlist = playlists.find((p: Playlist) => p.id === id);

    if (!playlist) {
      throw new Error("Playlist not found !");
    }

    playlist.name = playlistReceived.name;
    if (playlistReceived.rootFolder) {
      playlist.rootFolder = playlistReceived.rootFolder;
      playlist.total = playlistReceived.total;
    }

    writeFile(PATH_FILE, JSON.stringify(playlists, null, 2), "utf8");

    return playlist;
  }

  /**
   *
   * @param {Number} oldIndex
   * @param {Number} newIndex
   * @returns {Promise<Playlist[]>}
   */
  public static async move(oldIndex: number, newIndex: number): Promise<Playlist[]> {
    const playlists: Playlist[] = await this.getAll();

    if (oldIndex < 0 || playlists.length < oldIndex) {
      throw new Error("Playlist not found !");
    }
    const playlist: Playlist = playlists[oldIndex];
    playlists.splice(oldIndex, 1);
    playlists.splice(newIndex, 0, playlist);

    writeFile(PATH_FILE, JSON.stringify(playlists, null, 2), "utf8");

    return playlists;
  }

  /**
   * @param {string} id
   */
  public static async delete(id: string): Promise<void> {
    let playlists: Playlist[] = await this.getAll();

    const index: number = playlists.findIndex((playlist: Playlist) => playlist.id === id);
    if (index <= -1) {
      throw new Error("Playlist not found !");
    }

    playlists.splice(index, 1);
    writeFile(PATH_FILE, JSON.stringify(playlists, null, 2), "utf8");
  }

  /**
   *
   * @param {string} idPlaylist
   * @param {AudioItem} audioItem
   * @param {string} path
   * @param {Number} index
   * @returns {Promise<Playlist>}
   */
  public static async addPlaylistItem(idPlaylist: string, audioItem: AudioItem, idFolder: string, index: number) {
    let playlistsSaved: Playlist[] = await this.getAll(PATH_FILE_SAVE);
    let playlist: Playlist = playlistsSaved.find((p: Playlist) => p.id === idPlaylist);
    
    // If not found : We get the source one, from the "actual" database
    if (!playlist) {
      playlist = await this.get(idPlaylist);
      playlistsSaved.push(playlist);
    }

    const newAudio: PlaylistItemBack = {
      children: [],
      id: uuidv4(),
      idAudio: audioItem.id,
      name: "",
      path: "",
      surname: "",
    };

    // If an id was given : we add to the corresponding folder
    // If no id was given : add to the root of the playlist
    if (!!idFolder) {
      let folder: PlaylistItemBack = null;
      try {
        folder = this.getFolder(idFolder, playlist.rootFolder);
      } catch (err: any) {
        throw new Error("Invalid folder ID !");
      }

      if (!folder) {
        throw new Error("Incorrect folder ID !");
      }

      if (index < 0 || folder.children.length < index) {
        throw new Error("Incorrect index !");
      }

      folder.children.splice(index, 0, newAudio);
    } else {
      if (index < 0 || playlist.rootFolder.length < index) {
        throw new Error("Incorrect index !");
      }

      playlist.rootFolder.splice(index, 0, newAudio);
    }
    
    playlist.total += 1;

    writeFile(PATH_FILE_SAVE, JSON.stringify(playlistsSaved, null, 2), "utf8");

    return playlist;
  }

  /**
   *
   * @param {string} idPlaylist
   * @param {PlaylistItemFilled} playlistItem
   * @returns {Promise<Playlist>}
   */
  public static async updatePlaylistItem(idPlaylist: string, idItem: string, playlistItem: PlaylistItemBack): Promise<Playlist> {
    let playlists: Playlist[] = await this.getAll(PATH_FILE_SAVE);
    let playlist: Playlist = playlists.find((p: Playlist) => p.id === idPlaylist);

    // If not found : We get the source one, from the "actual" database
    if (!playlist) {
      playlist = await this.get(idPlaylist);
    }

    let folder: PlaylistItemBack;
    try {
      folder = this.getParentFolder(idPlaylist, playlist.rootFolder);
    } catch (err: any) {
      throw new Error("Invalid params !");
    }

    let itemToEdit: PlaylistItemBack;

    if (!!folder) {
      itemToEdit = folder.children.find((f: PlaylistItemBack) => f.id === idItem);
    } else {
      // Si dossier non trouvé : il est à la racine
      itemToEdit = playlist.rootFolder.find((f: PlaylistItemBack) => f.id === idItem);
    }
    itemToEdit.surname = playlistItem.surname || "";

    writeFile(PATH_FILE_SAVE, JSON.stringify(playlists, null, 2), "utf8");
    return playlist;
  }

  /**
   * @param {string} idPlaylist
   * @param {string} idItem
   */
  public static async deleteItem(idPlaylist: string, idItem: string): Promise<Playlist> {
    let playlists: Playlist[] = await this.getAll(PATH_FILE_SAVE);
    let playlist: Playlist = playlists.find((p: Playlist) => p.id === idPlaylist);

    // If not found : We get the source one, from the "actual" database
    if (!playlist) {
      playlist = await this.get(idPlaylist);
    }

    let folder: PlaylistItemBack = null;
    try {
      folder = this.getParentFolder(idItem, playlist.rootFolder);
    } catch (err: any) {
      throw new Error("Invalid ID !");
    }

    // folder found (and not the root folder) : take children / No folder found : remove from root
    const arr: PlaylistItemBack[] = (!!folder && !!folder.id) ? folder.children : playlist.rootFolder;
    const indexFile: number = arr.findIndex((file: PlaylistItemBack) => file.id === idItem);
    arr.splice(indexFile, 1);

    playlist.total--;
    writeFile(PATH_FILE_SAVE, JSON.stringify(playlists, null, 2), "utf8");

    return playlist;
  }

  /**
   * @param {string} idPlaylist
   * @param {string} idItem
   * @param {string} idFolderToMoveTo
   * @param {Number} newIndex
   */
  public static async movePlaylistItem(idPlaylist: string, idItem: string, idFolderToMoveTo: string, newIndex: number): Promise<Playlist> {
    let playlists: Playlist[] = await this.getAll(PATH_FILE_SAVE);
    let playlist: Playlist= playlists.find((p: Playlist) => p.id === idPlaylist);

    // If not found : We get the source one, from the "actual" database
    if (!playlist) {
      playlist = await this.get(idPlaylist);
    }

    // 1 - Remove from old location
    // We fetch the parent folder in the arborescence
    const oldFolder: PlaylistItemBack[] = this.getParentFolder(idItem, playlist.rootFolder)?.children || playlist.rootFolder;
    let index: number = oldFolder.findIndex((p: PlaylistItemBack) => p.id === idItem);
    if (index < 0) {
      throw new Error("Item not found !");
    }

    const item: PlaylistItemBack = oldFolder[index];
    oldFolder.splice(index, 1);

    // 2 - Add to new location
    const newFolder: PlaylistItemBack[] = this.getParentFolder(idFolderToMoveTo, playlist.rootFolder)?.children || playlist.rootFolder;
    newFolder.splice(newIndex, 0, item);

    // 3 - save and return playlist
    writeFile(PATH_FILE_SAVE, JSON.stringify(playlists, null, 2), "utf8");

    return playlist;
  }

  /**
   *
   * @param {string} idPlaylist
   * @returns {Promise<Playlist>}
   */
  public static savePlaylist(idPlaylist: string): Promise<Playlist> {
    return this.savePlaylistFromFolderAToFolderB(idPlaylist, PATH_FILE_SAVE, PATH_FILE);
  }

  /**
   *
   * @param {string} idPlaylist
   * @returns {Promise<Playlist>}
   */
  public static resetPlaylist(idPlaylist: string): Promise<Playlist> {
    return this.savePlaylistFromFolderAToFolderB(idPlaylist, PATH_FILE, PATH_FILE_SAVE);
  }

  /**
   *
   * @param {string} idPlaylist
   * @param {string} pathFrom
   * @param {string} pathTo
   * @returns {Promise<Playlist>}
   */
  private static async savePlaylistFromFolderAToFolderB(idPlaylist: string, pathFrom: string, pathTo: string) {
    const playlistToSave: Playlist = (await this.getAll(pathFrom)).find((playlist: Playlist) => playlist.id === idPlaylist);
    if (!playlistToSave) {
      throw new Error("Playlist not found !");
    }

    let playlists: Playlist[] = await this.getAll(pathTo);
    const index: number = playlists.findIndex((playlist: Playlist) => playlist.id === idPlaylist);
    if (index < 0) {
      throw new Error("Playlist not found !");
    }

    playlists[index] = playlistToSave;

    writeFile(pathTo, JSON.stringify(playlists, null, 2), "utf8");
    return playlistToSave;
  }

  // UTILS

  /**
   * Returns a folder given its ID, or one of its children's ID
   * @param {string} id
   * @param {*} folder
   * @returns
   */
  private static getFolder(id: string, folder: PlaylistItemBack[]): PlaylistItemBack {
    for (let item of folder) {
      if (!item.children) {
        continue;
      }
      if ((item.id === id) || item.children.find((el: PlaylistItemBack) => !el.children && el.id === id)) {
        return item;
      }

      const returnedItem = this.getFolder(id, item.children);
      if (!!returnedItem) {
        return returnedItem;
      }
  }
  }

  /**
   * FIXME Returns a folder given the ID of one of its children
   * @param {string} id
   * @param {*} folder
   * @returns
   */
  private static getParentFolder(id: string, folder: PlaylistItemBack[]): PlaylistItemBack {
    for (let item of folder) {
      if (!!item.children) {
        if (!!item.children.find((el: PlaylistItemBack) => el.id === id)) {
          return item;
        }

        const returnedItem = this.getFolder(id, item.children);
        if (!!returnedItem) {
          return returnedItem;
        }
      }
    }
  }
}
