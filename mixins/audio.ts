// Imports
import { Component, Vue } from 'nuxt-property-decorator';
import PlaylistItem from '~/models/models/playlist-item';

@Component
export default class AudioMixin extends Vue {

  /**
   * 
   * @param id 
   * @param items 
   * @returns 
   */
   public getPlaylistItemById(id: string, items: PlaylistItem[]): PlaylistItem {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        return items[i];
      }

      if (items[i].children && items[i].children.length !== 0) {
        const item = this.getPlaylistItemById(id, items[i].children);
        if (!!item) {
          return item;
        }
      }
    }
  }



  /**
   * 
   * @param id 
   * @param items 
   * @returns 
   */
   public getFolderContainingPlaylistItemById(id: string, items: PlaylistItem[]): PlaylistItem {
    for (let i = 0; i < items.length; i++) {
      if (!!items[i].children) {
        if (items[i].children.some(item => item.id === id)) {
          return items[i];
        }

        const item = this.getFolderContainingPlaylistItemById(id, items[i].children);
        if (!!item) {
          return item;
        }
      }
    }
  }
}
