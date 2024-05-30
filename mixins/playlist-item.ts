import { Component, Vue } from 'nuxt-property-decorator';
import PlaylistItemBack from '~/models/models/playlist-item-back';

@Component
export default class PlaylistItemMixin extends Vue {

  /**
  Returns whether a given Playlist Item is a folder or not
  @param file Playlist Item to examine
  @return Whether a given Playlist Item is a folder or not
  */
  public isFolder(file: PlaylistItemBack): boolean {
    return !this.isFile(file);
  }

  /**
  Returns whether a given Playlist Item is an item or not
  @param file Playlist Item to examine
  @return Whether a given Playlist Item is an item or not
  */
  public isFile(file: PlaylistItemBack): boolean {
    var DOT_CHARACTER = '.';
    return file.path.includes(DOT_CHARACTER);
  }
};
