import AudioCategory from "~/models/models/audio-category";

const DEFAULT_VOLUME = 0.75;
const EnumAudioFolder: AudioCategory[] = [
    { id: 1, title: "Ambiance", icon: "mdi-city-variant-outline", audio: {}, howl: undefined, isPlaying: false, isLooping: false, hasError: false, volume: DEFAULT_VOLUME },
    { id: 2, title: "Musique", icon: "mdi-music-note", audio: {}, howl: undefined, isPlaying: false, isLooping: false, hasError: false, volume: DEFAULT_VOLUME },
    { id: 3, title: "SFX", icon: "mdi-ear-hearing", audio: {}, howl: undefined, isPlaying: false, isLooping: false, hasError: false, volume: DEFAULT_VOLUME },
];

export default EnumAudioFolder;
