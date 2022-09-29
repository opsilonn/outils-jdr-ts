import { Howl } from "howler";

export default class AudioCategory {
    id: number;
    title: string;
    icon: string;
    audio: any;
    howl: Howl;
    isPlaying: boolean;
    isLooping: boolean;
    hasError: boolean;
    volume: number;

    constructor(id: number, title: string, icon: string) {
        this.id = id;
        this.title = title;
        this.icon = icon;
        this.audio = {};
        this.howl = undefined;
        this.isPlaying = false;
        this.isLooping = false;
        this.hasError = false;
        this.volume = 0.75;
    }
}