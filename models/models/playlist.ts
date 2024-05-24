import PlaylistItemBack from "~/models/models/playlist-item-back";

export default interface Playlist {
    id: string;
    name: string;
    rootFolder: PlaylistItemBack[];    
    total: number;
}
