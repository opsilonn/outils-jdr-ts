import { Component, Vue } from 'nuxt-property-decorator';
import PlaylistItemBack from '~/models/models/playlist-item-back';

@Component
export default class AudioMixin extends Vue {

  /**
   * 
   * @param id 
   * @param items 
   * @returns 
   */
  public getPlaylistItem(id: string, items: PlaylistItemBack[]): PlaylistItemBack {
    for (let item of items) {
      if (item.id === id) {
        return item;
      }

      const child = this.getPlaylistItem(id, item.children);
      if (!!child) {
        return child;
      }
    }
  }

  /**
   * 
   * @param id 
   * @param items 
   * @returns 
   */
  public getFolderContainingPlaylistItem(id: string, items: PlaylistItemBack[]): PlaylistItemBack {
    for (let item of items) {
      if (!item.children) {
        continue;
      }

      if (item.children.some(item => item.id === id)) {
        return item;
      }

      const child = this.getFolderContainingPlaylistItem(id, item.children);
      if (!!child) {
        return child;
      }
    }
  }
}
