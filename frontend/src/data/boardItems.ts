export interface BoardItem {
  id: string;
  name: string;
  popupId: string;
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
    desktop: { left: 35, top: 35, width: 28, rotation: -2 },
    mobile: { left: 30, top: 40, width: 45, rotation: -2 },
  },
  {
    id: "suspect-1",
    name: "Подозреваемый Агент",
    popupId: "suspect-1",
    desktop: { left: 12, top: 12, width: 12, rotation: -8 },
    mobile: { left: 10, top: 15, width: 26, rotation: -8 },
  },
  {
    id: "suspect-2",
    name: "Подозреваемый Информатор",
    popupId: "suspect-2",
    desktop: { left: 70, top: 11, width: 12, rotation: 8 },
    mobile: { left: 68, top: 15, width: 26, rotation: 8 },
  },
  {
    id: "note",
    name: "Записка о расписании",
    popupId: "schedule",
    desktop: { left: 11, top: 46, width: 15, rotation: 4 },
    mobile: { left: 11, top: 70, width: 32, rotation: 4 },
  },
  {
    id: "map",
    name: "Карта Вокзал 1853",
    popupId: "location",
    desktop: { left: 52, top: 62, width: 15, rotation: -4 },
    mobile: { left: 50, top: 72, width: 35, rotation: -4 },
  },
  {
    id: "phone",
    name: "Телефон регистрации",
    popupId: "registration",
    desktop: { left: 72, top: 70, width: 13, rotation: 6 },
    mobile: { left: 70, top: 115, width: 30, rotation: 6 },
  },
  {
    id: "clock",
    name: "Часы начала",
    popupId: "schedule",
    desktop: { left: 42, top: 11, width: 9, rotation: -12 },
    mobile: { left: 44, top: 18, width: 20, rotation: -12 },
  },
  {
    id: "evidence",
    name: "Пакет с уликами",
    popupId: "games",
    desktop: { left: 78, top: 55, width: 11, rotation: 14 },
    mobile: { left: 64, top: 120, width: 26, rotation: 14 },
  },
  {
    id: "newspaper",
    name: "Газетная вырезка",
    popupId: "newspaper",
    desktop: { left: 75, top: 28, width: 13, rotation: -5 },
    mobile: { left: 62, top: 65, width: 30, rotation: -5 },
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
