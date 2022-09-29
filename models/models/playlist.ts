import PlaylistItem from "~/models/models/playlist-item";

export default class Playlist {
    id: string;
    name: string;
    total: number;
    rootFolder: PlaylistItem[];    

    constructor(id: string, name: string, total: number, rootFolder: PlaylistItem[]) {
        this.id = id;
        this.name = name;
        this.total = total;
        this.rootFolder = rootFolder;
    }
}