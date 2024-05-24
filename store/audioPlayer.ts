import { Howl } from "howler";
import { Module, Mutation, VuexModule } from 'vuex-module-decorators';
import AudioCategory from "~/models/models/audio-category";
import AudioItem from "~/models/models/audio-item";
const INDEX_OF_CATEGORY_NAME = 2;

@Module({
  // Ne pas remplir le champ "name", car pour X raison ça cause l'erreur ERR_STORE_NOT_PROVIDED
  stateFactory: true,
  namespaced: true
})
export default class AudioPlayerStore extends VuexModule {
  private DEFAULT_VOLUME = 0.75;
  public audioCategories: AudioCategory[] = [
    { id: 1, title: "Ambiance", icon: "mdi-city-variant-outline", audio: {}, howl: undefined, isPlaying: false, isLooping: false, hasError: false, volume: this.DEFAULT_VOLUME },
    { id: 2, title: "Musique", icon: "mdi-music-note", audio: {}, howl: undefined, isPlaying: false, isLooping: false, hasError: false, volume: this.DEFAULT_VOLUME },
    { id: 3, title: "SFX", icon: "mdi-ear-hearing", audio: {}, howl: undefined, isPlaying: false, isLooping: false, hasError: false, volume: this.DEFAULT_VOLUME },
  ];

  /** */
  @Mutation
  setAudio(audio: AudioItem): void {
    const category: AudioCategory = this.audioCategories.find((tab) => audio.path.split("/")[INDEX_OF_CATEGORY_NAME].includes(tab.title));
    if (!category) {
      alert("Music not found !");
      return;
    }

    // If an audio was already loaded : stop it
    if (!!category.howl) {
      category.howl.pause();
    }

    category.audio = audio;
    category.isPlaying = true;
    category.howl = new Howl({
      src: [audio.path],
      loop: category.isLooping,
      volume: category.volume,
    });

    // We play the audio file
    category.howl.play();
    category.hasError = false;

    // When it ends, and if loop is disabled : disable the play flag
    category.howl.on("end", () => {
      if (!category.isLooping) {
        category.isPlaying = false;
      }
    });

    // If it fails to load
    category.howl.on("loaderror", () => {
      category.isPlaying = false;
      category.howl = null;
      category.hasError = true;
      alert(`Piste audio non trouvée\n - nom : ${audio.name}\n - chemin : ${audio.path}`);
    });
  }

  /**
   * Sets the volume of a specific category
   * @param {int} id identifier of the category to update
   */
  @Mutation
  setVolume(id: number): void {
    const category: AudioCategory = this.audioCategories.find((_) => _.id === id);
    if (!!category?.howl) {
      category.howl.volume(category.volume);
    }
  }

  /**
   * Either plays or pauses the track of a specific category
   * @param {int} id identifier of the category to update
   */
  @Mutation
  setPlayOrPause(id: number): void {
    const category: AudioCategory = this.audioCategories.find((_) => _.id === id);
    if (!!category?.howl) {
      category.isPlaying = !category.isPlaying;
      if (category.isPlaying) {
        category.howl.play();
      } else {
        category.howl.pause();
      }
    }
  }

  /**
   * Either enables or disables the loop of a specific category
   * @param {number} id identifier of the category to update
   */
  @Mutation
  setLoop(id: number): void {
    const category: AudioCategory = this.audioCategories.find((_) => _.id === id);
    category.isLooping = !category.isLooping;
    if (!!category?.howl) {
      category.howl.loop(category.isLooping);
    }
  }

  /** Stops all tracks that are being played */
  @Mutation
  stopAllAudioTracks(): void {
    this.audioCategories
      .filter((category: AudioCategory) => !!category?.howl)
      .forEach((category: AudioCategory) => category.howl.pause());
  }
};
