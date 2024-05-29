<template>
  <div>
    <!-- Waiting to load data... -->
    <Loader v-if="isPageLoading" message="Chargement des données..." />

    <!-- data loaded ! -->
    <div v-else>
      <!-- Tab selection -->
      <!-- TO DO : the tabs should stay displayed, and not be scrolled -->
      <v-tabs v-model="selectedTabIndex" grow icons-and-text>
        <v-tab v-for="(tab, i) in tabs" :key="`tab_${i}`">
          <span class="shrink d-none d-sm-flex">{{ tab.title }}</span>
          <v-icon>{{ tab.icon }}</v-icon>
        </v-tab>
      </v-tabs>

      <!-- Tab view -->
      <v-tabs-items v-model="selectedTabIndex">
        <!-- Dynamically create tab view for audio categories -->
        <v-tab-item v-for="(tab, i) in EnumAudioFolder" :key="`tab_item_category${i}`" :transition="false" class="scroll">
          <v-list>
            <TreeviewAudio :audioFolder="getAudioFolderByTitle(tab.title)" :enablePlay="true" />
          </v-list>
        </v-tab-item>

        <!-- Manually create tab view for audio playlists -->
        <v-tab-item :transition="false">
          <v-row>
            <!-- left : playlists -->
            <v-col cols="4">
              <!-- Create new playlist -->
              <center>
                <v-btn class="ma-4 zoom-sm primary" rounded @click="openDialogNew()">
                  <v-icon left> mdi-folder-plus </v-icon>
                  Nouvelle Playlist
                </v-btn>
              </center>

              <!-- then, we iterate through playlists -->
              <v-list shaped two-line v-if="playlistListIsReady">
                <v-list-item-group v-model="selectedPlaylistIndex" color="primary">
                  <draggable draggable=".item" :list="[]" @end="DnD_movePlaylist">
                    <div v-for="playlist in playlists" :key="playlist.id" class="item">
                      <v-list-item :key="`playlist_${playlist.id}`">
                        <v-list-item-icon>
                          <v-icon v-text="'mdi-music-note'" />
                        </v-list-item-icon>

                        <v-list-item-content>
                          <v-list-item-title v-text="playlist.name" />
                          <v-list-item-subtitle v-text="`piste${playlist.total ? 's' : ''} : ${playlist.total}`" />
                        </v-list-item-content>

                        <v-list-item-action>
                          <v-icon color="grey lighten-1" v-text="'mdi-dots-vertical'" @click="openDialogEdit($event, playlist.id)" />
                        </v-list-item-action>
                      </v-list-item>
                    </div>
                  </draggable>
                </v-list-item-group>
              </v-list>
            </v-col>

            <!-- divider -->
            <v-divider vertical />

            <!-- right - current playlist -->
            <v-col cols="8" v-if="selectedPlaylistIndex >= 0" class="scroll">
              <!-- Add audios -->
              <center>
                <v-btn class="ma-4 zoom-sm primary" rounded @click="openDialogPlaylist(playlists[selectedPlaylistIndex].id)">
                  <v-icon left v-text="'mdi-folder-plus'" />
                  Gérer musique
                </v-btn>
              </center>

              <!-- No music warning -->
              <div v-if="!playlists[selectedPlaylistIndex].rootFolder.length">
                <center class="font-italic pa-8">Cette playlist est vide :'(</center>
              </div>

              <!-- playlist's audios -->
              <div v-else>
                <TreeviewAudio
                  :audioFolder="playlists[selectedPlaylistIndex].rootFolder"
                  :idPlaylist="playlists[selectedPlaylistIndex].id"
                  :enablePlay="true"
                />
              </div>
            </v-col>
          </v-row>
        </v-tab-item>
      </v-tabs-items>

      <!-- Dashboard (fixed to the bottom) -->
      <FooterAudio />

      <!-- Dialog to create, update or delete a playlist -->
      <DialogPlaylistData @close-dialog="dialogPlaylist = false" :dialog="dialogPlaylist" :idPlaylist="currentPlaylistId" />

      <!-- Dialog to add or remove audios from a playlist -->
      <DialogPlaylistContent @close-dialog="closeDialogPlaylist()" :dialog="dialogPlaylistAudio" :idPlaylist="currentPlaylistId" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, namespace } from "nuxt-property-decorator";
import draggable from "vuedraggable";
import DialogPlaylistContent from "~/components/dialog-playlist-content.vue";
import DialogPlaylistData from "~/components/dialog-playlist-data.vue";
import FooterAudio from "~/components/footer-audio.vue";
import LoaderComponent from "~/components/loader.vue";
import TreeviewAudio from "~/components/treeview-audio.vue";
import EnumAudioFolder from "~/models/enums/EnumAudioFolder";
import AudioCategory from "~/models/models/audio-category";
import AudioItem from "~/models/models/audio-item";
import Playlist from "~/models/models/playlist";
import PlaylistItemBack from "~/models/models/playlist-item-back";
const audioItem = namespace("audioItem");
const playlist = namespace("playlist");
const audioPlayer = namespace("audioPlayer");

@Component({
  components: { DialogPlaylistData, DialogPlaylistContent, FooterAudio, LoaderComponent, TreeviewAudio, draggable }
})
export default class AudioPage extends Vue {
  isPageLoading: boolean = true;
  EnumAudioFolder = EnumAudioFolder;

  // Tabs related
  tabs: AudioCategory[] = [];
  selectedTabIndex: number = null;

  // Playlists related
  playlistListIsReady: boolean = true;
  selectedPlaylistIndex: number = -1;
  currentPlaylistId: string = "";
  dialogPlaylist: boolean = false;
  dialogPlaylistAudio: boolean = false;

  @audioItem.State
  public audiosDatabase: any;
  @audioItem.Getter
  public getAudioFolderByTitle: (name: string) => PlaylistItemBack[];
  @playlist.State
  public playlists: any;
  @audioItem.Action
  public fetchAudioFolder: () => void;
  @playlist.Action
  public fetchAllPlaylists: any;
  @playlist.Action
  public movePlaylist: any;
  @audioPlayer.Mutation
  public stopAllAudioTracks: any;
  @playlist.Mutation
  public SET_AUDIO_DATABASE: (database: AudioItem[]) => void;

  /** */
  get playlistIds(): string[] {
    return this.playlists.map((playlist: Playlist) => playlist.id);
  }

  /** Allows to select the latest playlist if one is added, or deselect if one is deleted */
  @Watch("playlistIds")
  playlistIdsChanged(newValue: any, oldValue: any): void {
      // Must be watched here, since the creation / deletion is done in another component
      if (oldValue.length < newValue.length) {
        // a playlist is added
        this.selectedPlaylistIndex = this.playlists.length - 1;
      } else if (oldValue.length > newValue.length) {
        // a playlist is deleted
        this.selectedPlaylistIndex = -1;
      }
  }

  async mounted() {
    // We set the tabs
    const tabsCategory: AudioCategory[] = EnumAudioFolder;
    const tabPlaylist: AudioCategory = {
      audio: null,
      hasError: false,
      howl: null,
      icon: "mdi-playlist-music",
      id: 4,
      isLooping: false,
      isPlaying: false,
      title: "Playlist",
      volume: 0,
    };
    this.tabs = tabsCategory.concat([tabPlaylist]);

    // We fetch the audio data
    await this.fetchAudioFolder();

    // We load the audios Database in the playlist's store
    this.SET_AUDIO_DATABASE(this.audiosDatabase);

    // We fetch the playlists
    await this.fetchAllPlaylists();

    this.selectedPlaylistIndex = -1;

    this.isPageLoading = false;
  }


    /** */
    openDialogNew(): void {
      this.currentPlaylistId = "";
      this.dialogPlaylist = true;
    }

    /** */
    openDialogEdit(event: PointerEvent, id: string): void {
      event.stopPropagation();
      this.currentPlaylistId = id;
      this.dialogPlaylist = true;
    }

    /** */
    openDialogPlaylist(id: string): void {
      this.currentPlaylistId = id;
      this.dialogPlaylistAudio = true;
    }

    /** */
    closeDialogPlaylist(): void {
      this.dialogPlaylistAudio = false;
    }

    /** */
    async DnD_movePlaylist(event: any): Promise<void> {
      this.playlistListIsReady = false;
      await this.movePlaylist({ oldIndex: event.oldIndex, newIndex: event.newIndex });
      if (this.selectedPlaylistIndex === event.oldIndex) {
        this.selectedPlaylistIndex = event.newIndex;
      }

      // Why this stupid code ?
      // When you DnD a playlist in the list, the v-list-group doesn't register the changes, 
      // And the playlist that was First before, is still considered First after, even if it was moved elsewhere
      // TL&DR : I didn't find a way to solve the issue
      this.playlistListIsReady = true;
    }

  /** Whenever the page is exited : remove all audio tracks */
  beforeRouteLeave(to: any, from: any, next: any): void {
    this.stopAllAudioTracks();
    return next();
  }

  head() {
    return { title: "Audio" };
  }

  transition(to: any, from: any) {
    if (!from) {
      return 'slide-left'
    }
    return +to.query.page < +from.query.page ? 'slide-right' : 'slide-left'
  }
}
</script>

<style scoped>
.scroll {
  height: 750px;
  overflow: scroll;
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
/* Hide scrollbar for Chrome, Safari and Opera */
.scroll::-webkit-scrollbar {
  display: none;
}
</style>
