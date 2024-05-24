import PlaylistItemBack from "./playlist-item-back";

export default interface PlaylistItemFront extends PlaylistItemBack {
    form: boolean;
    isEditing: boolean;
    surnameEdit: string;
}
