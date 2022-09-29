export default class PlaylistItem {
    id: string;
    idAudio: string;
    surname: string;
    children: PlaylistItem[];

    constructor(id: string, idAudio: string, surname: string, children: PlaylistItem[]) {
        this.id = id;
        this.idAudio = idAudio;
        this.surname = surname;
        this.children = children;
    }
}
