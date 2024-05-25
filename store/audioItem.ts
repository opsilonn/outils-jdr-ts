import axios from 'axios';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import AudioItem from '~/models/models/audio-item';
import PlaylistItemBack from '~/models/models/playlist-item-back';
import PlaylistItemFront from '~/models/models/playlist-item-front';

@Module({
  // Ne pas remplir le champ "name", car pour X raison ça cause l'erreur ERR_STORE_NOT_PROVIDED
  stateFactory: true,
  namespaced: true
})
export default class AudioItemStore extends VuexModule {
  public audioFolder: PlaylistItemFront[] = [];
  public audiosDatabase: AudioItem[] = [];

  get getAudioFromDatabase(): (id: string) => AudioItem {
    return (id: string) => this.audiosDatabase.find((item: AudioItem) => item.id === id);
  }

  /**
   * Gets a specific folder from the audioFolder, given its title
   * @param {String} name Title of the folder to find
   */
  get getAudioFolderByTitle(): (name: string) => PlaylistItemBack[] {
    return (name: string) => this.audioFolder.find((item: AudioItem) => item.name === name)?.children || [];
  }

  /** */
  @Mutation
  initAudio(audioData: { audioFolder: PlaylistItemFront[], audiosDatabase: AudioItem[] }): void {
    // Audios ordered in corresponding subfolders
    this.audioFolder = audioData.audioFolder;
    // Every audio gathered in a single list
    this.audiosDatabase = audioData.audiosDatabase;
  }

  /** Gets ALL the audio folder */
  @Action({ rawError: true })
  async fetchAudioFolder(): Promise<void> {
    const audioData: { audioFolder: PlaylistItemBack[], audiosDatabase: AudioItem[] } = (await axios.get("/api/audios")).data;
    this.context.commit("initAudio", audioData);
  }
}
