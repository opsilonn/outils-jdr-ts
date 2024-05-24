<template>
  <div>
    <v-treeview :items="audioFolder" item-key="idAudio" hoverable open-on-click shaped dense>
      <!-- Prepend icon -->
      <template v-slot:prepend="{ item, open }">
        <div @click="onClick(item)">
          <v-icon v-text="getItemIcon(item, open)" />
        </div>
      </template>

      <!-- Label (either text OR input-field)-->
      <template v-slot:label="{ item }">
        <draggable
          :class="{
            playlist: enableDnd && enableEdit,
            database: enableDnd && !enableEdit,
          }"
          :list="[]"
          :group="enableDnd ? 'node' : ''"
          :id="!!item.id ? item.id : item.idAudio"
          @end="endDnD"
        >
          <div class="pa-4" @click="onClick(item)">
            <!-- If editing: input-field -->
            <v-form v-if="!!item.isEditing" :ref="`form_playlist_audio_${item.id}`" v-model="item.form" @submit.prevent>
              <v-text-field v-model="item.surnameEdit" :rules="[rules.max50, rules.ascii]" :label="item.name" counter @click.stop @keyup.enter.stop="editAudioFromPlaylist(item)">
                <template v-slot:append>
                  <v-fade-transition leave-absolute>
                    <v-icon v-text="'mdi-check'" @click.stop="editAudioFromPlaylist(item)" />
                  </v-fade-transition>
                </template>
              </v-text-field>
            </v-form>

            <!-- If consulting: label -->
            <div v-else>
              <span v-if="item.surname">
                {{ item.surname }}<br />
                <span class="font-italic">{{ item.name }}</span>
              </span>
              <span v-else> {{ item.name }} </span>
            </div>
          </div>
        </draggable>
      </template>

      <!-- Append icon -->
      <template v-if="enableEdit" v-slot:append="{ item }" @click="onClick(item)">
        <!-- Is editing the name -->
        <v-icon v-if="item.isEditing" class="zoom" color="grey lighten-1" v-text="'mdi-cancel'" @click.stop="cancelEdit(item)" />

        <!-- other actions -->
        <div v-else>
          <!-- Rename item -->
          <v-icon class="zoom" color="grey lighten-1" v-text="'mdi-pencil'" @click.stop="beginEdit(item)" />

          <!-- Remove item -->
          <v-icon class="zoom" color="grey lighten-1" v-text="'mdi-delete'" @click.stop="tryDeleteFromPlaylist(item.id)" />
        </div>
      </template>
    </v-treeview>

    <!-- TO DO : remove this "br" tag and find a proper way to ensure that the footer never covers any data -->
    <br v-for="n in 10" :key="n" />
  </div>
</template>

<script lang="ts">
// Imports
import { Component, Prop, mixins, namespace } from "nuxt-property-decorator";
import draggable from "vuedraggable";
import EventBus from "~/EventBus";
import RulesMixin from "~/mixins/rules";
import AudioItem from "~/models/models/audio-item";
import Playlist from "~/models/models/playlist";
import PlaylistItemBack from "~/models/models/playlist-item-back";
import PlaylistItemFront from "~/models/models/playlist-item-front";
const playlist = namespace("playlist");
const audioPlayer = namespace("audioPlayer");

@Component({
  components: { draggable },
})
export default class TreeviewAudioComponent extends mixins(RulesMixin) {

  @Prop({ required: false }) readonly audioFolder: PlaylistItemFront[];
  @Prop({ required: false }) readonly idPlaylist: string;
  @Prop({ required: false }) readonly enableDnd: boolean;
  @Prop({ required: false }) readonly enableEdit: boolean;
  @Prop({ required: false }) readonly enablePlay: boolean;

  @playlist.Getter
  public getPlaylistById: () => Playlist;
  @playlist.Action
  public updatePlaylistAudio: ({ idPlaylist, playlistItem }: { idPlaylist: string; playlistItem: PlaylistItemBack }) => Promise<void>;
  @playlist.Action
  public deleteFromPlaylist: (paramsReceived: { idPlaylist: string; idItem: string }) => Promise<void>;
  @audioPlayer.Mutation
  public setAudio: (audio: AudioItem) => void;

  /** */
  getItemIcon(item: PlaylistItemFront, isOpen: boolean): string {
    return item.children && 0 < item.children.length
      ? isOpen
        ? "mdi-folder-open"
        : "mdi-folder"
      : item.path.split("/")[2].includes("Ambiance")
      ? "mdi-city-variant-outline"
      : item.path.split("/")[2].includes("Musique")
      ? "mdi-music-note"
      : item.path.split("/")[2].includes("SFX")
      ? "mdi-ear-hearing"
      : "mdi-help";
  }

  /** */
  onClick(file: PlaylistItemFront): void {
    if ((!file.children || (file.children && file.children.length == 0)) && this.enablePlay && !file.isEditing) {
      this.setAudio(file);
    }
  }

  /** */
  beginEdit(file: PlaylistItemFront): void {
    file.isEditing = true;
    file.form = false;
    file.surnameEdit = file.surname || "";
  }

  /** */
  cancelEdit(file: PlaylistItemFront): void {
    file.isEditing = false;
  }

  /** */
  async editAudioFromPlaylist(file: PlaylistItemFront): Promise<void> {
    // If the form is valid
    const formId: string = `form_playlist_audio_${file.id}`;
    const form: any = this.$refs[formId];

    if (form.validate()) {
      // We update the playlist if the surname is different
      if (file.surname !== file.surnameEdit) {
        const data: { idPlaylist: string; playlistItem: PlaylistItemBack } = {
          idPlaylist: this.idPlaylist,
          playlistItem: {
            children: [],
            id: file.id,
            idAudio: file.idAudio,
            name: "",
            path: "",
            surname: file.surnameEdit
          },
        };
        await this.updatePlaylistAudio(data);
      }

      // We first edit the object
      file.isEditing = false;
      file.surname = file.surnameEdit;
    }
  }

  /** */
  public async tryDeleteFromPlaylist(idItem: string): Promise<void> {
    await this.deleteFromPlaylist({ idPlaylist: this.idPlaylist, idItem: idItem });
  }

  /** */
  public endDnD(event: any): void {
    if (!this.enableDnd) {
      return;
    }

    const isFromDatabase: boolean = event.from.className.includes("database");
    const isToDatabase: boolean = event.to.className.includes("database");
    const isToPlaylist: boolean = event.to.className.includes("playlist");

    // Moving between the database : no action
    if (isFromDatabase && isToDatabase) {
      return;
    }

    const eventName: string = isFromDatabase && isToPlaylist ? EventBus.ADD_TO_PLAYLIST : EventBus.MOVE_WITHIN_PLAYLIST;
    EventBus.$emit(eventName, event);
  }
}
</script>
