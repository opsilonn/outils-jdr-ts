// Imports
import { Howl } from "howler";
import { Module, VuexModule, Mutation } from 'vuex-module-decorators';
import AudioCategory from "~/models/models/audio-category";
import AudioItem from "~/models/models/audio-item";
const INDEX_OF_CATEGORY_NAME = 2;

@Module({
  // Ne pas remplir le champ "name", car pour X raison ça cause l'erreur ERR_STORE_NOT_PROVIDED
  stateFactory: true,
  namespaced: true
})
export default class AudioPlayerStore extends VuexModule {
  public audioCategories: AudioCategory[] = [
    new AudioCategory(1, "Ambiance", "mdi-city-variant-outline"),
    new AudioCategory(2, "Musique", "mdi-music-note"),
    new AudioCategory(3, "SFX", "mdi-ear-hearing")
  ];

  /** */
  @Mutation
  setAudio(audio: AudioItem): void {
    // We get the category's index
    const category: AudioCategory = this.audioCategories.find((tab) => audio.path.split("/")[INDEX_OF_CATEGORY_NAME].includes(tab.title));

    // If not found : ERROR
    if (!category) {
      alert("Music not found !");
      return;
    }

    // If an audio was already loaded : stop it
    if (!!category.howl) {
      category.howl.pause();
    }

    // We set some values
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
    // We get the category
    const category: AudioCategory = this.audioCategories.find((_) => _.id === id);

    // If a file, is loaded, we set the volume accordingly
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
    // We get the category
    const category: AudioCategory = this.audioCategories.find((_) => _.id === id);

    // If a file, is loaded, we play or pause it accordingly
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
    // We get the category
    const category: AudioCategory = this.audioCategories.find((_) => _.id === id);

    category.isLooping = !category.isLooping;

    // If a file, is loaded, we (dis)enable the loop it accordingly
    if (!!category?.howl) {
      category.howl.loop(category.isLooping);
    }
  }

  /** Stops all tracks that are being played */
  @Mutation
  stopAllAudioTracks(): void {
    this.audioCategories.forEach((category: AudioCategory) => {
      if (!!category?.howl) {
        category.howl.pause();
      }
    });
  }
};
