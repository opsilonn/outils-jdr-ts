<template>
  <!-- Dashboard (fixed to the bottom) -->
  <v-footer fixed padless>
    <v-card flat tile width="100%" class="text-center grey darken-3">
      <div v-for="(tab, i) in EnumAudioFolder" :key="tab.id">
        <v-row align="center">
          <!-- col 1 - category -->
          <v-col cols="3">
            <h3 class="font-weight-bold text-right" :class="{ 'error--text': tab.hasError }" v-text="tab.title" />
          </v-col>

          <!-- col 2 - name -->
          <v-col cols="6">
            <v-card-text>
              <div :class="{ 'error--text': tab.hasError }">
                {{ tab.audio.surname || tab.audio.name || "..." }}
                <span v-if="tab.audio.surname" class="font-italic" :class="{ 'error--text': tab.hasError }"> ({{ tab.audio.name }}) </span>
              </div>
            </v-card-text>
          </v-col>

          <!-- col 3 - buttons -->
          <v-col cols="3">
            <v-row align="center">
              <!-- slider sound -->
              <v-col cols="6">
                <!-- TO DO : center vertically the slider -->
                <v-slider v-model="tab.volume" track-color="grey darken-1" step="0.05" min="0" max="1" thumb-label hide-detail />
              </v-col>
              <v-col cols="6">
                <!-- button play / pause -->
                <v-btn icon @click="setPlayOrPause(tab.id)">
                  <v-icon v-text="tab.isPlaying ? 'mdi-pause' : 'mdi-play'" />
                </v-btn>

                <!-- button loop -->
                <v-btn icon @click="setLoop(tab.id)">
                  <v-icon v-text="'mdi-autorenew'" :disabled="!tab.isLooping" />
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Divider, except last row -->
        <v-divider v-if="i !== EnumAudioFolder.length - 1" />
      </div>
    </v-card>
  </v-footer>
</template>

<script lang="ts">
import { Component, Vue, Watch, namespace } from "nuxt-property-decorator";
import EnumAudioFolder from "~/models/enums/EnumAudioFolder";
import AudioCategory from "~/models/models/audio-category";
const audioPlayer = namespace("audioPlayer");

@Component({})
export default class FooterAudioComponent extends Vue {
  EnumAudioFolder = EnumAudioFolder;

  @audioPlayer.Mutation
  public setVolume: (id: number) => void;
  @audioPlayer.Mutation
  public setPlayOrPause: (id: number) => void;
  @audioPlayer.Mutation
  public setLoop: (id: number) => void;

  /** */
  public get audioCategoriesVolumes(): { id: number, volume: number }[] {
    return EnumAudioFolder.map(( category: AudioCategory) => ({
      id: category.id,
      volume: category.volume,
    }));
  }

  /** */
  @Watch("audioCategoriesVolumes", { deep: true })
  public volumeChanged(newValue: { id: number, volume: number }[], oldValue: { id: number, volume: number }[]): void {
    for (let i = 0; i < oldValue.length; i++) {
      if (oldValue[i].volume !== newValue[i].volume) {
        this.setVolume(oldValue[i].id);
        return;
      }
    }
  }
}
</script>
