import { Action, Module, VuexModule, Mutation } from 'vuex-module-decorators';
import axios from 'axios';
import AudioItem from '~/models/models/audio-item';
import PlaylistItemFilled from '~/models/models/playlist-item-filled';
import PlaylistItem from '~/models/models/playlist-item';

@Module({
  // Ne pas remplir le champ "name", car pour X raison ça cause l'erreur ERR_STORE_NOT_PROVIDED
  stateFactory: true,
  namespaced: true
})
export default class AudioItemStore extends VuexModule {
  public audioFolder: PlaylistItemFilled[] = [];
  public audiosDatabase: AudioItem[] = [];

  get getAudioFromDatabase(): (id: string) => AudioItem {
    return (id: string) => this.audiosDatabase.find((_) => _.id === id);
  }

  /**
   * Gets a specific folder from the audioFolder, given its title
   * @param {String} name Title of the folder to find
   */
  get getAudioFolderByTitle(): (name: string) => PlaylistItem[] {
    return (name: string) => this.audioFolder.find((_) => _.name === name)?.children || [];
  }

  /** */
  @Mutation
  initAudio(audioData: { audioFolder: PlaylistItemFilled[], audiosDatabase: AudioItem[] }): void {
    // Audios ordered in corresponding subfolders
    this.audioFolder = audioData.audioFolder;
    // Every audio gathered in a single list
    this.audiosDatabase = audioData.audiosDatabase;
  }

  /** Gets ALL the audio folder */
  @Action({ rawError: true })
  async fetchAudioFolder(): Promise<void> {
    const audioData: any = (await axios.get("/api/audios")).data;
    this.context.commit("initAudio", audioData);
  }
}
