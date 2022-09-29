import { Action, Module, VuexModule, Mutation } from 'vuex-module-decorators';
import axios from 'axios';
import Playlist from '~/models/models/playlist';
import PlaylistItemFilled from '~/models/models/playlist-item-filled';
import AudioItem from '~/models/models/audio-item';
import PlaylistItem from '~/models/models/playlist-item';

@Module({
  // Ne pas remplir le champ "name", car pour X raison ça cause l'erreur ERR_STORE_NOT_PROVIDED
  stateFactory: true,
  namespaced: true
})
export default class PlaylistStore extends VuexModule {
  public playlists: Playlist[] = [];
  savedPlaylist: Playlist = new Playlist("", "", 0, []);
  database: AudioItem[] = [];
  
  get getPlaylistById(): (id: string) => Playlist {
    return (id: string) => this.playlists.find((_) => _.id === id);
  }

  // Why forEach-loops, if I modify the index ?
  // You cannot modify the actual object when itirating, only the properties. Hence, we need to modify at the index
  // items.forEach(item => item = new Obj(...)) = WRONG
  // items.forEach(item => item.property = ...) = GOOD
  public static FILL_PLAYLIST_ITEMS(database: any, items: PlaylistItem[]): void {
    items.forEach((item: PlaylistItem, i: number) => {
      if (item.idAudio) {
        const audio = database.find((a: AudioItem) => a.id === items[i].idAudio);
        items[i] = new PlaylistItemFilled(item.id, item.idAudio, item.surname, item.children, audio.name, audio.path);
      }

      if (item.children && 0 < item.children.length) {
        PlaylistStore.FILL_PLAYLIST_ITEMS(database, item.children);
      }
    });
  }

  /**
   *
   * @param {*} playlist
   */
  @Mutation
   private ADD_PLAYLIST(playlist: Playlist): void {
    const index: number = this.playlists.findIndex((_) => _.id === playlist.id);
    if (index < 0) {
      this.playlists.push(playlist);
    } else {
      this.playlists[index] = playlist;
      this.playlists = [...this.playlists];
    }
  }

  /**
   *
   * @param {*} oldIndex
   * @param {*} newIndex
   */
  @Mutation
  private MOVE_PLAYLIST({ oldIndex, newIndex }: any): void {
    const playlist: Playlist = this.playlists[oldIndex];
    this.playlists.splice(oldIndex, 1);
    this.playlists.splice(newIndex, 0, playlist);
    this.playlists = [...this.playlists];
  }

  /**
   *
   * @param {*} id
   */
  @Mutation
  DELETE_PLAYLIST(id: string): void {
    const index: number = this.playlists.findIndex((_: Playlist) => _.id === id);
    if (index >= 0) {
      this.playlists.splice(index, 1);
    }
  }

  /**
   *
   * @param {*} savedPlaylist
   */
  @Mutation
  SET_SAVED_PLAYLIST(savedPlaylist: Playlist): void {
    this.savedPlaylist = savedPlaylist;
  }

  /**
   *
   */
  @Mutation
  RESET_SAVED_PLAYLIST(): void {
    this.savedPlaylist = new Playlist("", "", 0, []);
  }

  /**
   *
   * @param {*} database
   */
  @Mutation
  SET_AUDIO_DATABASE(database: AudioItem[]): void {
    this.database = JSON.parse(JSON.stringify(database));
  }

  /** */
  @Action
  async fetchAllPlaylists(): Promise<void> {
    const playlists: Playlist[] = (await axios.get("/api/playlists")).data;
    playlists.forEach((p: Playlist) => {
      PlaylistStore.FILL_PLAYLIST_ITEMS(this.database, p.rootFolder);
      this.context.commit("ADD_PLAYLIST", p);
    });
  }

  /** */
  @Action
  async createPlaylist(playlist: Playlist): Promise<Playlist> {
    const newPlaylist: Playlist = (await axios.post("/api/playlist", playlist)).data;
    this.context.commit("ADD_PLAYLIST", newPlaylist);
    return newPlaylist;
  }

  /** */
  @Action
  async updatePlaylist(playlist: Playlist): Promise<Playlist> {
    const updatedPlaylist: Playlist = (await axios.put(`/api/playlist/${playlist.id}`, playlist)).data;
    this.context.commit("ADD_PLAYLIST", updatedPlaylist);
    return updatedPlaylist;
  }

  /** */
  @Action
  async movePlaylist({ oldIndex, newIndex }: { oldIndex: number, newIndex: number }): Promise<void> {
    await axios.put(`/api/playlists/move`, {
      oldIndex: oldIndex,
      newIndex: newIndex
    });
    this.context.commit("MOVE_PLAYLIST", { oldIndex: oldIndex, newIndex: newIndex });
  }

  /** */
  @Action
  async deletePlaylist(playlistId: string): Promise<boolean> {
    const result: boolean = await axios.delete(`/api/playlist/${playlistId}`);
    this.context.commit("DELETE_PLAYLIST", playlistId);
    return result;
  }

  /** */
  @Action
  async savePlaylist(idPlaylist: string): Promise<boolean> {
    const savedPlaylist: Playlist = (await axios.put(`/api/playlist/${idPlaylist}/save`)).data;
    console.log('avant');
    PlaylistStore.FILL_PLAYLIST_ITEMS(this.database, savedPlaylist.rootFolder);
    this.context.commit("ADD_PLAYLIST", savedPlaylist);
    console.log('après');
    return true;
  }

  // SAVED

  /** */
  @Action
  async fetchSavedPlaylist(id : string): Promise<void> {
    const savedPlaylist: Playlist = (await axios.get(`/api/playlist/${id}/saved`)).data;
    PlaylistStore.FILL_PLAYLIST_ITEMS(this.database, savedPlaylist.rootFolder);
    this.context.commit("SET_SAVED_PLAYLIST", savedPlaylist);
  }

  /** */
  @Action
  async addAudioToPlaylist(paramsReceived: { idPlaylist: string, audioItem: AudioItem, idFolder: string, index: number }): Promise<void> {
    const params: { audioItem: AudioItem, idFolder: string, index: number } = {
      audioItem: paramsReceived.audioItem,
      idFolder: paramsReceived.idFolder,
      index: paramsReceived.index,
    };
    const playlist: Playlist = (await axios.post(`/api/playlist/${paramsReceived.idPlaylist}/audio`, params)).data;
    PlaylistStore.FILL_PLAYLIST_ITEMS(this.database, playlist.rootFolder);
    this.context.commit("SET_SAVED_PLAYLIST", playlist);
  }

  /** */
  @Action
  async moveItemWithinPlaylist(paramsReceived: { idPlaylist: string, idItem: string, idFolderToMoveTo: string, newIndex: number }): Promise<void> {
    const params: { idFolderToMoveTo: string, newIndex: number } = {
      idFolderToMoveTo: paramsReceived.idFolderToMoveTo,
      newIndex: paramsReceived.newIndex
    };
    const playlist: Playlist = (await axios.put(`/api/playlist/${paramsReceived.idPlaylist}/audio/${paramsReceived.idItem}/move`, params)).data;
    PlaylistStore.FILL_PLAYLIST_ITEMS(this.database, playlist.rootFolder);
    this.context.commit("SET_SAVED_PLAYLIST", playlist);
  }

  /** */
  @Action
  async updatePlaylistAudio({ idPlaylist, playlistItem }: { idPlaylist: string, playlistItem: PlaylistItemFilled }): Promise<void> {
    const playlist = (await axios.put(`/api/playlist/${idPlaylist}/audio/${playlistItem.id}`, playlistItem)).data;
    PlaylistStore.FILL_PLAYLIST_ITEMS(this.database, playlist.rootFolder);
    this.context.commit("SET_SAVED_PLAYLIST", playlist);
  }

  /** */
  @Action
  async deleteFromPlaylist(paramsReceived: { idPlaylist: string, idItem: string }): Promise<void> {
    const playlist = (await axios.delete(`/api/playlist/${paramsReceived.idPlaylist}/audio/${paramsReceived.idItem}`)).data;
    PlaylistStore.FILL_PLAYLIST_ITEMS(this.database, playlist.rootFolder);
    this.context.commit("SET_SAVED_PLAYLIST", playlist);
  }

  /** */
  @Action
  async resetPlaylist(idPlaylist: string): Promise<void> {
    const resetedPlaylist: Playlist = (await axios.put(`/api/playlist/${idPlaylist}/reset`)).data;
    PlaylistStore.FILL_PLAYLIST_ITEMS(this.database, resetedPlaylist.rootFolder);
    this.context.commit("SET_SAVED_PLAYLIST", resetedPlaylist);
  }
}