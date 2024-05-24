import PlaylistItemBack from "./playlist-item-back";

export default class PlaylistItemFilled extends PlaylistItemBack {
    name: string;
    path: string;
    
    isEditing: boolean;
    form: boolean;
    surnameEdit: string;

    constructor(id: string, idAudio: string, surname: string, children: PlaylistItemBack[], name: string, path: string) {
        super(id, idAudio, surname, children);
        this.name = name;
        this.path = path;

        this.isEditing = false;
        this.form = false;
        this.surnameEdit = '';
    }
}
