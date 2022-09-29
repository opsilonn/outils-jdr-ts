export default class NavItem {
    title: string;
    route: string;
    src: string;

    constructor(title: string, route: string, src: string) {
        this.title = title;
        this.route = route;
        this.src = src;
    }
}