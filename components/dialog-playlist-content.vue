<template>
  <v-dialog v-model="dialog" fullscreen hide-overlay persistent transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="closeDialog">
          <v-icon v-text="'mdi-close'" />
        </v-btn>

        <v-toolbar-title>
          Éditer playlist :
          <span class="font-italic">{{ savedPlaylist.name }} </span>
        </v-toolbar-title>

        <v-spacer />

        <v-toolbar-items>
          <v-btn text @click="reset" v-text="'Réinitialiser'" class="black--text" />
          <v-btn text @click="save" v-text="'Sauvegarder'" />
        </v-toolbar-items>
      </v-toolbar>

      <v-row justify="center">
        <!-- col 1 - audio to select from -->
        <v-col cols="6">
          <!-- TO DO : the tabs should stay displayed, and not be scrolled -->
          <v-tabs v-model="selectedTabIndex" grow icons-and-text>
            <v-tab v-for="(tab, i) in EnumAudioFolder" :key="`tab_${i}`">
              <span class="shrink d-none d-sm-flex" v-text="tab.title" />
              <v-icon v-text="tab.icon" />
            </v-tab>
          </v-tabs>

          <!-- Tab view -->
          <v-tabs-items v-model="selectedTabIndex">
            <div class="scroll">
              <!-- Dynamically create tab view for audio categories -->
              <v-tab-item v-for="(tab, i) in EnumAudioFolder" :key="`tab_item_category${i}`" :transition="false">
                <v-list>
                  <TreeviewAudio :audioFolder="getAudioFolderByTitle(tab.title)" :idPlaylist="idPlaylist"
                    :enableDnd="true" :enablePlay="true" />
                </v-list>
              </v-tab-item>
            </div>
          </v-tabs-items>
        </v-col>
        <v-divider vertical />

        <!-- col 2 - playlist -->
        <v-col cols="6">
          <div class="scroll">
            <draggable v-if="!savedPlaylist.rootFolder.length" class="playlist" :list="[]" group="node">
              <v-row>
                <v-col>
                  <!-- No music warning -->
                  <div>
                    <center class="font-italic pa-8">Cette playlist est vide :'(</center>
                  </div>
                </v-col>
              </v-row>
            </draggable>

            <!-- playlist's audios -->
            <div v-else>
              <TreeviewAudio :audioFolder="savedPlaylist.rootFolder" :idPlaylist="idPlaylist" :enableDnd="true"
                :enableEdit="true" :enablePlay="true" />
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Watch, mixins, namespace } from "nuxt-property-decorator";
import draggable from "vuedraggable";
import EventBus from "~/EventBus";
import TreeviewAudioComponent from "~/components/treeview-audio.vue";
import AudioMixin from "~/mixins/audio-mixin";
import EnumAudioFolder from "~/models/enums/EnumAudioFolder";
import AudioItem from "~/models/models/audio-item";
import Playlist from "~/models/models/playlist";
import PlaylistItemBack from "~/models/models/playlist-item-back";
const playlist = namespace("playlist");
const audioItem = namespace("audioItem");
const audioPlayer = namespace("audioPlayer");

@Component({
  components: { draggable, TreeviewAudioComponent },
})
export default class DialogPlaylistContentComponent extends mixins(AudioMixin) {
  @Prop({ required: true }) readonly idPlaylist: string;
  @Prop({ required: true }) readonly dialog: boolean;

  EnumAudioFolder = EnumAudioFolder;
  isPlaylistUpdated: boolean = false;
  selectedTabIndex: number = null;

  @playlist.Getter
  public getPlaylistById: (id: string) => Playlist;
  @audioItem.Getter
  public getAudioFromDatabase: (id: string) => AudioItem;
  @audioItem.Getter
  public getAudioFolderByTitle: (name: string) => PlaylistItemBack[];
  @playlist.State
  public savedPlaylist: Playlist;
  @playlist.Action
  public fetchSavedPlaylist: (id: string) => Promise<void>;
  @playlist.Action
  public addAudioToPlaylist: (paramsReceived: { idPlaylist: string; audioItem: AudioItem; idFolder: string; index: number }) => Promise<void>;
  @playlist.Action
  public moveItemWithinPlaylist: (paramsReceived: { idPlaylist: string; idItem: string; idFolderToMoveTo: string; newIndex: number }) => Promise<void>;
  @playlist.Action
  public resetPlaylist: (idPlaylist: string) => Promise<void>;
  @playlist.Action
  public savePlaylist: (idPlaylist: string) => Promise<boolean>;
  @playlist.Mutation
  public RESET_SAVED_PLAYLIST: () => void;

  /** whenever the dialog is opened */
  @Watch("dialog")
  public dialogChanged(): void {
    if (this.dialog) {
      this.RESET_SAVED_PLAYLIST();
      this.fetchSavedPlaylist(this.idPlaylist);
      this.isPlaylistUpdated = false;
    }
  }

  public mounted(): void {
    EventBus.$on(EventBus.ADD_TO_PLAYLIST, async (event: CustomEvent) => this.addFile(event));
    EventBus.$on(EventBus.MOVE_WITHIN_PLAYLIST, async (event: any) => this.tryMoveItemWithinPlaylist(event));
  }

  /**
   * Adds a file to a Playlist
   * @param event 
   */
  private async addFile(event: any): Promise<void> {
    const audioToAdd: AudioItem = this.getAudioFromDatabase(event.from.id);
    const playlistItemNextTo: PlaylistItemBack = this.getPlaylistItem(event.to.id, this.savedPlaylist.rootFolder);
    const index = Math.max(0, this.savedPlaylist.rootFolder.indexOf(playlistItemNextTo));

    await this.addAudioToPlaylist({
      idPlaylist: this.idPlaylist,
      audioItem: audioToAdd,
      idFolder: null, // For the time being, we add to the root folder (which means : id === nulll)
      index: index,
    });

    this.isPlaylistUpdated = true;
  }

  /**
   * Moves a Playlist Item within the Playlist
   * @param event 
   */
  private async tryMoveItemWithinPlaylist(event: any): Promise<void> {
    const folder: PlaylistItemBack = this.getFolderContainingPlaylistItem(event.to.id, this.savedPlaylist.rootFolder);
    const idFolderToMoveTo: string = folder?.id || "";
    const newIndex: number = (folder?.children || this.savedPlaylist.rootFolder).findIndex((item: PlaylistItemBack) => item.id === event.to.id);

    await this.moveItemWithinPlaylist({
      idPlaylist: this.idPlaylist,
      idItem: event.from.id,
      idFolderToMoveTo: idFolderToMoveTo,
      newIndex: newIndex,
    });

    this.isPlaylistUpdated = true;
  }

  /** Emits the event to close the dialog */
  public closeDialog(): void {
    if (!this.isPlaylistUpdated || confirm("Vous avez fait des changements !\nÊtes-vous sûr de vouloir quitter ?")) {
      this.$emit("close-dialog");
    }
  }

  /** Resets the Playlist to its previous saved state */
  public async reset(): Promise<void> {
    await this.resetPlaylist(this.idPlaylist);
  }

  /** Saves the modification done to the Playlist */
  public async save(): Promise<void> {
    await this.savePlaylist(this.idPlaylist);
    this.$emit("close-dialog");
  }
}
</script>

<style scoped>
.scroll {
  height: 750px;
  overflow: scroll;
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

/* Hide scrollbar for Chrome, Safari and Opera */
.scroll::-webkit-scrollbar {
  display: none;
}
</style>
~/models/models/playlist-item-back