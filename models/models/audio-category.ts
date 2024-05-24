import { Howl } from "howler";

export default interface AudioCategory {
    id: number;
    title: string;
    icon: string;
    audio: any;
    howl: Howl;
    isPlaying: boolean;
    isLooping: boolean;
    hasError: boolean;
    volume: number;
}
