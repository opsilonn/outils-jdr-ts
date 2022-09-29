export default class Competence {
    public id: number;
    name: string;
    min: number;
    range: number;
    orientationsIndexes: number[];
    isCombat: boolean;
    isSocial: boolean;


    constructor(id: number, name: string, min: number, range: number, orientationsIndexes: number[], isCombat: boolean, isSocial: boolean) {
        this.id = id;
        this.name = name;
        this.min = min;
        this.range = range;
        this.orientationsIndexes = orientationsIndexes;
        this.isCombat = isCombat;
        this.isSocial = isSocial;
    }
}