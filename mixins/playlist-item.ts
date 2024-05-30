import { Component, Vue } from 'nuxt-property-decorator';
import PlaylistItemBack from '~/models/models/playlist-item-back';

@Component
export default class PlaylistItemMixin extends Vue {

  /**
  Returns whether a given Playlist Item is a folder or not
  @param file Playlist Item to examine
  @return Whether a given Playlist Item is a folder or not
  */
  isFolder(file: PlaylistItemBack): boolean {
    return file.children.length == 0;
  }

  /**
  Returns whether a given Playlist Item is an item or not
  @param file Playlist Item to examine
  @return Whether a given Playlist Item is an item or not
  */
  isFile(file: PlaylistItemBack): boolean {
    return !this.isFolder(file);
  }
};
