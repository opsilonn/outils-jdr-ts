// Imports
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
   public getPlaylistItemById(id: string, items: PlaylistItemBack[]): PlaylistItemBack {
    for (let item of items) {
      if (item.id === id) {
        return item;
      }

      const child = this.getPlaylistItemById(id, item.children);
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
   public getFolderContainingPlaylistItemById(id: string, items: PlaylistItemBack[]): PlaylistItemBack {
    for (let item of items) {
      if (!item.children) {
        continue;
      }

      if (item.children.some(item => item.id === id)) {
        return item;
      }

      const child = this.getFolderContainingPlaylistItemById(id, item.children);
      if (!!child) {
        return child;
      }
    }
  }
}
