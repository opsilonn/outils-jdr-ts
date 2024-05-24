export default interface Competence {
    id: number;
    isCombat: boolean;
    isSocial: boolean;
    min: number;
    name: string;
    orientationsIndexes: number[];
    range: number;
}
