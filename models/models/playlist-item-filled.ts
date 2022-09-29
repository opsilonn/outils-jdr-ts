import PlaylistItem from "../../models/models/playlist-item";

export default class PlaylistItemFilled extends PlaylistItem {
    name: string;
    path: string;

    constructor(id: string, idAudio: string, surname: string, children: PlaylistItem[], name: string, path: string) {
        super(id, idAudio, surname, children);
        this.name = name;
        this.path = path;
    }
}
