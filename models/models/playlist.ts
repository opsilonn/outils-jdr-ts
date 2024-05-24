import PlaylistItemBack from "~/models/models/playlist-item-back";

export default class Playlist {
    id: string;
    name: string;
    total: number;
    rootFolder: PlaylistItemBack[];    

    constructor(id: string, name: string, total: number, rootFolder: PlaylistItemBack[]) {
        this.id = id;
        this.name = name;
        this.total = total;
        this.rootFolder = rootFolder;
    }
}