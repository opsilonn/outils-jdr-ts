import NavItem from "~/models/models/nav-item";

const EnumRouter = Object.freeze([
  new NavItem("L'appel de Cthulhu", "/call-of-cthulhu", "/icons/icon-coc.svg"),
  new NavItem("Donjons et Dragons", "/dungeons-and-dragons", "/icons/icon-dnd.png"),
  new NavItem("Audio", "/audio", "/icons/icon-audio.svg"),
  new NavItem("Test", "/test", "/icons/icon-wip.png"),
]);

export default EnumRouter;
