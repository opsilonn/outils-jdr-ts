<template>
  <v-container>
    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="500px" @click:outside="closeDialog">
      <v-card>
        <!-- Title -->
        <v-card-title class="headline primary--text" v-text="isNewPlaylist ? 'Nouvelle playlist' : 'Modification playlist'" />

        <!-- Content -->
        <v-card-text>
          <!-- Content -->
          Veuillez entrer le nom de la playlist

          <!-- Playlist's name (for verification) -->
          <v-form ref="form" v-model="form" @submit.prevent>
            <v-container>
              <v-text-field label="Nom de la Playlist" v-model="playlistName" clearable :rules="[rules.required, rules.max50, rules.ascii]" counter="100" type="text" />
            </v-container>
          </v-form>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions>
          <v-spacer />

          <!-- Button : delete -->
          <v-btn v-if="!isNewPlaylist" color="error" text @click="remove" v-text="'Supprimer'" />

          <!-- Button : cancel -->
          <v-btn color="warning" text @click="closeDialog" v-text="'Annuler'" />

          <!-- Button : action -->
          <v-btn color="success" text @click="action" v-text="isNewPlaylist ? 'Créer' : 'Modifier'" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
// Imports
import { Component, Prop, Watch, mixins, namespace } from "nuxt-property-decorator";
import RulesMixin from "~/mixins/rules";
import Playlist from "~/models/models/playlist";
const playlist = namespace("playlist");

@Component({})
export default class DialogPlaylistDataComponent extends mixins(RulesMixin) {
  @Prop({ required: false }) readonly idPlaylist: string;
  @Prop({ required: true }) readonly dialog: boolean;

  form: boolean = false;
  playlist: Playlist = null;
  playlistName: string = "";

  @playlist.Getter
  public getPlaylistById: (id: string) => Playlist;
  @playlist.Action
  public createPlaylist: (playlist: Playlist) => Promise<Playlist>;
  @playlist.Action
  public updatePlaylist: (playlist: Playlist) => Promise<Playlist>;
  @playlist.Action
  public deletePlaylist: (playlistId: string) => Promise<boolean>;

  /** whenever the dialog is opened */
  @Watch("dialog")
  dialogChanged(): void {
    if (this.dialog) {
      // get the Playlist
      this.playlist = this.getPlaylistById(this.idPlaylist);
      this.playlistName = this.playlist?.name || "";
    }
  }

  /** */
  get isNewPlaylist(): boolean {
    return !this.idPlaylist || this.idPlaylist === "";
  }

  /** Emits the event to close the dialog */
  public closeDialog(): void {
    this.$emit("close-dialog");
  }

  /** */
  public async remove(): Promise<void> {
    await this.deletePlaylist(this.idPlaylist);
    this.$emit("close-dialog");
    // this.$refs.form.reset();
  }

  /** */
  public async action(): Promise<void> {
    // If the form is valid
    // if (this.$refs.form.validate()) {
    if (this.isNewPlaylist) {
      this.add();
    } else {
      this.update();
    }
    // }
  }

  /** */
  private async add(): Promise<void> {
    const newPlaylist: Playlist = new Playlist(null, this.playlistName, null, null);
    const playlist: Playlist = await this.createPlaylist(newPlaylist);
    if (!!playlist) {
      this.$emit("close-dialog");
      // this.$refs.form.reset();
    }
  }

  /** */
  private async update(): Promise<void> {
    const editedPlaylist: Playlist = new Playlist(this.playlist.id, this.playlistName, null, null);
    const playlist: Playlist = await this.updatePlaylist(editedPlaylist);
    if (!!playlist) {
      this.$emit("close-dialog");
      // this.$refs.form.reset();
    }
  }
}
</script>
