import fs from "fs";
import path from "path";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import AudioItem from "../../models/models/audio-item";
import Playlist from "../../models/models/playlist";
import PlaylistItem from "../../models/models/playlist-item";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const pathFile = path.join(__dirname, "../data/playlists.json");
const pathFileSave = path.join(__dirname, "../data/playlists_save.json");

export default class PlaylistCRUD {
  /**
   * @param {string} id
   * @returns {Promise<Playlist>}
   */
  static async get(id: string): Promise<Playlist> {
    // Read the audio
    const playlists: Playlist[] = await this.getAll();

    // Find the correct playlist
    const playlist: Playlist = playlists.find((_: Playlist) => _.id === id);

    // If the playlist was not found : throw error
    if (!playlist) {
      throw new Error("Playlist not found !");
    }

    return playlist;
  }

  /**
   * @param {string} id
   * @returns {Promise<Playlist>}
   */
  static async getSaved(id: string): Promise<Playlist> {
    // Read the audio
    const playlists: Playlist[] = await this.getAll(pathFileSave);

    // Find the correct playlist
    let playlist: Playlist = playlists.find((_: Playlist) => _.id === id);

    // If the playlist was not found : get the actual one
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
  static async getAll(path: string = pathFile):Promise<Playlist[]> {
    if (!fs.existsSync(path)) {
      writeFile(path, JSON.stringify([], null, 2), "utf8");
      return [];
    }

    // Read the audio
    const playlistsAsString: string = await readFile(path, "utf8");

    // Parse the audio as JSON
    return JSON.parse(playlistsAsString);
  }

  /**
   * @param {PlaylistCRUD} playlistReceived
   * @returns {Promise<Playlist>}
   */
  static async add(playlistReceived: Playlist): Promise<Playlist> {
    // Get all the playlists
    let playlists: Playlist[] = await this.getAll();

    // Create new Playlist
    const playlist: Playlist = new Playlist(uuidv4(), playlistReceived.name, 0, []);

    // Add new Playlist
    playlists.push(playlist);
    writeFile(pathFile, JSON.stringify(playlists, null, 2), "utf8");

    return playlist;
  }

  /**
   *
   * @param {string} id
   * @param {PlaylistCRUD} playlistReceived
   * @returns {Promise<Playlist>}
   */
  static async update(id: string, playlistReceived: Playlist): Promise<Playlist> {
    // Get all the playlists
    let playlists: Playlist[] = await this.getAll();

    // We get the wanted playlist
    const playlist: Playlist = playlists.find((_) => _.id === id);

    // If not found : throw Error
    if (!playlist) {
      throw new Error("Playlist not found !");
    }

    // We only update the name
    playlist.name = playlistReceived.name;
    if (playlistReceived.rootFolder) {
      playlist.rootFolder = playlistReceived.rootFolder;
      playlist.total = playlistReceived.total;
    }

    writeFile(pathFile, JSON.stringify(playlists, null, 2), "utf8");

    return playlist;
  }

  /**
   *
   * @param {Number} oldIndex
   * @param {Number} newIndex
   * @returns {Promise<Playlist[]>}
   */
  static async move(oldIndex: number, newIndex: number): Promise<Playlist[]> {
    // Get all the playlists
    const playlists: Playlist[] = await this.getAll();

    // 2 - move the playlist in the list
    if (oldIndex < 0 || playlists.length < oldIndex) {
      throw new Error("Playlist not found !");
    }
    const playlist: Playlist = playlists[oldIndex];
    playlists.splice(oldIndex, 1);
    playlists.splice(newIndex, 0, playlist);

    // 3 - save and return playlist
    writeFile(pathFile, JSON.stringify(playlists, null, 2), "utf8");

    return playlists;
  }

  /**
   * @param {string} id
   */
  static async delete(id: string): Promise<void> {
    // Get all the playlists
    let playlists: Playlist[] = await this.getAll();

    // get index of the playlist to remove
    const index: number = playlists.findIndex((_) => _.id === id);

    // invalid index : throw Error
    if (index <= -1) {
      throw new Error("Playlist not found !");
    }

    // Remove found Playlist
    playlists.splice(index, 1);

    // Re-write audio
    writeFile(pathFile, JSON.stringify(playlists, null, 2), "utf8");
  }

  /**
   *
   * @param {string} idPlaylist
   * @param {AudioItem} audioItem
   * @param {string} path
   * @param {Number} index
   * @returns {Promise<Playlist>}
   */
  static async addPlaylistItem(idPlaylist: string, audioItem: AudioItem, idFolder: string, index: number) {
    // Get all the playlists (of saves !)
    let playlistsSaved: Playlist[] = await this.getAll(pathFileSave);

    // We get the wanted playlist
    let playlist: Playlist = playlistsSaved.find((_) => _.id === idPlaylist);

    // If not found : We get the source one, from the "actual" database
    if (!playlist) {
      // We get the source playlist
      playlist = (await this.getAll()).find((_) => _.id === idPlaylist);
      if (!playlist) {
        throw new Error("Playlist not found !");
      }

      playlistsSaved.push(playlist);
    }

    // We initialize the new Audio
    const newAudio: PlaylistItem = new PlaylistItem(uuidv4(), audioItem.id, "", []);

    // If no id was given : add to the root of the playlist
    if (!!idFolder) {
      // We fetch the folder in the arborescence
      let folder: PlaylistItem = null;
      try {
        folder = this.getFolderByItemId(idFolder, playlist.rootFolder);
      } catch (err: any) {
        throw new Error("Invalid folder ID !");
      }

      if (!folder) {
        throw new Error("Incorrect folder ID !");
      }

      // Check for valid index
      if (index < 0 || folder.children.length < index) {
        throw new Error("Incorrect index !");
      }

      // Add to playlist
      folder.children.splice(index, 0, newAudio);
    } else {
      // Check for valid index
      if (index < 0 || playlist.rootFolder.length < index) {
        throw new Error("Incorrect index !");
      }

      // Add to playlist
      playlist.rootFolder.splice(index, 0, newAudio);
    }
    
    playlist.total += 1;

    writeFile(pathFileSave, JSON.stringify(playlistsSaved, null, 2), "utf8");

    return playlist;
  }

  /**
   *
   * @param {string} idPlaylist
   * @param {PlaylistItemFilled} playlistItem
   * @returns {Promise<Playlist>}
   */
  static async updatePlaylistItem(idPlaylist: string, idItem: string, playlistItem: PlaylistItem): Promise<Playlist> {
    // Get all the playlists
    let playlists: Playlist[] = await this.getAll(pathFileSave);

    // We get the wanted playlist
    let playlist: Playlist = playlists.find((_) => _.id === idPlaylist);

    // If not found : We get the source one, from the "actual" database
    if (!playlist) {
      // Get all the actual playlists
      playlists = await this.getAll();

      // We get the source playlist
      playlist = playlists.find((_) => _.id === idPlaylist);
      if (!playlist) {
        throw new Error("Playlist not found !");
      }
    }

    // We fetch the folder in the arborescence
    let folder: PlaylistItem;
    try {
      folder = this.getParentFolderByItemId(idPlaylist, playlist.rootFolder);
    } catch (err: any) {
      throw new Error("Invalid params !");
    }

    // We update the item
    let itemToEdit: PlaylistItem;

    if (!!folder) {
      itemToEdit = folder.children.find((f: PlaylistItem) => f.id === idItem);
    } else {
      // Si dossier non trouvé : il est à la racine
      itemToEdit = playlist.rootFolder.find((f: PlaylistItem) => f.id === idItem);
    }
    itemToEdit.surname = playlistItem.surname || "";

    writeFile(pathFileSave, JSON.stringify(playlists, null, 2), "utf8");
    return playlist;
  }

  /**
   * @param {string} idPlaylist
   * @param {string} idItem
   */
  static async deleteItem(idPlaylist: string, idItem: string): Promise<Playlist> {
    // Get all the playlists
    let playlists: Playlist[] = await this.getAll(pathFileSave);

    // We get the wanted playlist
    let playlist: Playlist = playlists.find((_) => _.id === idPlaylist);

    // If not found : We get the source one, from the "actual" database
    if (!playlist) {
      // Get all the actual playlists
      playlists = await this.getAll();

      // We get the source playlist
      playlist = playlists.find((_) => _.id === idPlaylist);
      if (!playlist) {
        throw new Error("Playlist not found !");
      }
    }

    // We fetch the folder in the arborescence
    let folder: any = null;
    try {
      folder = this.getParentFolderByItemId(idItem, playlist.rootFolder);
    } catch (err: any) {
      throw new Error("Invalid ID !");
    }

    // folder found (and not the root folder) : take children / No folder found : remove from root
    const arr: any = (!!folder && !!folder.id) ? folder.children : playlist.rootFolder;
    const indexFile: number = arr.findIndex((file: any) => file.id === idItem);
    arr.splice(indexFile, 1);

    // Remove file from Playlist
    playlist.total--;
    writeFile(pathFileSave, JSON.stringify(playlists, null, 2), "utf8");

    return playlist;
  }

  /**
   * @param {string} idPlaylist
   * @param {string} idItem
   * @param {string} idFolderToMoveTo
   * @param {Number} newIndex
   */
  static async movePlaylistItem(idPlaylist: string, idItem: string, idFolderToMoveTo: string, newIndex: number): Promise<Playlist> {
    // Get all the playlists
    let playlists: Playlist[] = await this.getAll(pathFileSave);

    // We get the wanted playlist
    let playlist: Playlist= playlists.find((_) => _.id === idPlaylist);

    // If not found : We get the source one, from the "actual" database
    if (!playlist) {
      // Get all the actual playlists
      playlists = await this.getAll();

      // We get the source playlist
      playlist = playlists.find((_) => _.id === idPlaylist);
      if (!playlist) {
        throw new Error("Playlist not found !");
      }
    }

    // 1 - Remove from old location
    // We fetch the parent folder in the arborescence
    const oldFolder: any = this.getParentFolderByItemId(idItem, playlist.rootFolder)?.children || playlist.rootFolder;
    let index: number = oldFolder.findIndex((_: any) => _.id === idItem);
    if (index < 0) {
      throw new Error("Item not found !");
    }

    const item: any = oldFolder[index];
    oldFolder.splice(index, 1);

    // 2 - Add to new location
    const newFolder: any = this.getParentFolderByItemId(idFolderToMoveTo, playlist.rootFolder)?.children || playlist.rootFolder;
    newFolder.splice(newIndex, 0, item);

    // 3 - save and return playlist
    writeFile(pathFileSave, JSON.stringify(playlists, null, 2), "utf8");

    return playlist;
  }

  /**
   *
   * @param {string} idPlaylist
   * @returns {Promise<Playlist>}
   */
  static savePlaylist(idPlaylist: string): Promise<Playlist> {
    return this.savePlaylistFromFolderAToFolderB(idPlaylist, pathFileSave, pathFile);
  }

  /**
   *
   * @param {string} idPlaylist
   * @returns {Promise<Playlist>}
   */
  static resetPlaylist(idPlaylist: string): Promise<Playlist> {
    return this.savePlaylistFromFolderAToFolderB(idPlaylist, pathFile, pathFileSave);
  }

  /**
   *
   * @param {string} idPlaylist
   * @param {string} pathFrom
   * @param {string} pathTo
   * @returns {Promise<Playlist>}
   */
  static async savePlaylistFromFolderAToFolderB(idPlaylist: string, pathFrom: string, pathTo: string) {
    // We get the wanted playlist
    const playlistToSave: Playlist = (await this.getAll(pathFrom)).find((_) => _.id === idPlaylist);

    // If not found : Error
    if (!playlistToSave) {
      throw new Error("Playlist not found !");
    }

    // Get all the playlists
    let playlists: Playlist[] = await this.getAll(pathTo);
    // We get the index of the playlist to override
    const index: number = playlists.findIndex((_) => _.id === idPlaylist);

    // If not found : Error
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
  static getFolderByItemId(id: string, folder: any): any {
    for (let i = 0; i < folder.length; i++) {
      const item = folder[i];

      if ((!!item.children && item.id === id) || !!(item.children || []).find((el: any) => !el.children && el.id === id)) {
        return item;
      }

      if (!!item.children) {
        const returnedItem = this.getFolderByItemId(id, item.children);
        if (!!returnedItem) {
          return returnedItem;
        }
      }
    }
  }

  /**
   * FIXME Returns a folder given the ID of one of its children
   * @param {string} id
   * @param {*} folder
   * @returns
   */
  static getParentFolderByItemId(id: string, folder: PlaylistItem[]): PlaylistItem {
    for (let i = 0; i < folder.length; i++) {
      const item = folder[i];

      if (!!item.children) {
        if (!!item.children.find((el: any) => el.id === id)) {
          return item;
        }

        const returnedItem = this.getFolderByItemId(id, item.children);
        if (!!returnedItem) {
          return returnedItem;
        }
      }
    }
  }
}
