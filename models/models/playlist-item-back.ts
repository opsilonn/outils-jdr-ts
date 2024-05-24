export default class PlaylistItemBack {
    id: string;
    idAudio: string;
    surname: string;
    children: PlaylistItemBack[];

    constructor(id: string, idAudio: string, surname: string, children: PlaylistItemBack[]) {
        this.id = id;
        this.idAudio = idAudio;
        this.surname = surname;
        this.children = children;
    }
}
