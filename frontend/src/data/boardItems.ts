export interface BoardItem {
  id: string;
  name: string;
  popupId: string;
  zIndex: number;
  desktop: {
    left: number; // %
    top: number;  // %
    width: number; // %
    rotation: number; // deg
  };
  mobile: {
    left: number; // %
    top: number;  // %
    width: number; // %
    rotation: number; // deg
  };
}

export const boardItems: BoardItem[] = [
  {
    id: "dossier",
    name: "Главное дело",
    popupId: "event-info",
    zIndex: 14,
    desktop: { left: 34, top: 20, width: 26, rotation: -2 },
    mobile: { left: 28, top: 32, width: 42, rotation: -2 },
  },
  {
    id: "suspect-1",
    name: "Подозреваемый Агент",
    popupId: "suspect-1",
    zIndex: 11,
    desktop: { left: 20, top: 14, width: 12, rotation: -8 },
    mobile: { left: 15, top: 14, width: 26, rotation: -8 },
  },
  {
    id: "suspect-2",
    name: "Подозреваемый Информатор",
    popupId: "suspect-2",
    zIndex: 11,
    desktop: { left: 61, top: 12, width: 11, rotation: 6 },
    mobile: { left: 60, top: 12, width: 26, rotation: 6 },
  },
  {
    id: "note",
    name: "Записка о расписании",
    popupId: "schedule",
    zIndex: 12,
    desktop: { left: 19, top: 42, width: 13, rotation: 4 },
    mobile: { left: 14, top: 62, width: 30, rotation: 4 },
  },
  {
    id: "map",
    name: "Карта Вокзал 1853",
    popupId: "location",
    zIndex: 15,
    desktop: { left: 51, top: 56, width: 13, rotation: -4 },
    mobile: { left: 28, top: 72, width: 32, rotation: -4 },
  },
  {
    id: "phone",
    name: "Настольные игры",
    popupId: "games",
    zIndex: 13,
    desktop: { left: 11, top: 74, width: 11, rotation: 6 },
    mobile: { left: 54, top: 102, width: 28, rotation: 6 },
  },
  {
    id: "clock",
    name: "Часы начала",
    popupId: "schedule",
    zIndex: 12,
    desktop: { left: 63, top: 40, width: 8, rotation: -12 },
    mobile: { left: 44, top: 12, width: 20, rotation: -12 },
  },
  {
    id: "evidence",
    name: "Регистрация сыщиков",
    popupId: "registration",
    zIndex: 10,
    desktop: { left: 32, top: 64, width: 10, rotation: 12 },
    mobile: { left: 64, top: 92, width: 24, rotation: 12 },
  },
  {
    id: "newspaper",
    name: "Газетная вырезка",
    popupId: "newspaper",
    zIndex: 9,
    desktop: { left: 72, top: 48, width: 11, rotation: -5 },
    mobile: { left: 64, top: 50, width: 26, rotation: -5 },
  },
];

export const threadConnections = [
  { from: "dossier", to: "suspect-1" },
  { from: "dossier", to: "suspect-2" },
  { from: "dossier", to: "note" },
  { from: "note", to: "map" },
  { from: "suspect-1", to: "newspaper" },
  { from: "evidence", to: "clock" },
  { from: "map", to: "phone" },
];
