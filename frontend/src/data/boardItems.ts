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
    mobile: { left: 32, top: 26, width: 28, rotation: -2 },
  },
  {
    id: "suspect-1",
    name: "Подозреваемый Агент",
    popupId: "suspect-1",
    zIndex: 11,
    desktop: { left: 20, top: 14, width: 14, rotation: -8 },
    mobile: { left: 8, top: 10, width: 18, rotation: -8 },
  },
  {
    id: "suspect-2",
    name: "Подозреваемый Информатор",
    popupId: "suspect-2",
    zIndex: 11,
    desktop: { left: 61, top: 12, width: 14, rotation: 6 },
    mobile: { left: 74, top: 10, width: 18, rotation: 6 },
  },
  {
    id: "note",
    name: "Записка о расписании",
    popupId: "schedule",
    zIndex: 22,
    desktop: { left: 19, top: 42, width: 15, rotation: 4 },
    mobile: { left: 10, top: 48, width: 17, rotation: 4 },
  },
  {
    id: "map",
    name: "Карта Вокзал 1853",
    popupId: "location",
    zIndex: 15,
    desktop: { left: 51, top: 56, width: 13, rotation: -4 },
    mobile: { left: 36, top: 62, width: 22, rotation: -4 },
  },
  {
    id: "phone",
    name: "Настольные игры",
    popupId: "games",
    zIndex: 21,
    desktop: { left: 8, top: 58, width: 20, rotation: 4 },
    mobile: { left: 8, top: 76, width: 22, rotation: 4 },
  },
  {
    id: "clock",
    name: "Часы начала",
    popupId: "schedule",
    zIndex: 12,
    desktop: { left: 59, top: 37, width: 8, rotation: -12 },
    mobile: { left: 42, top: 8, width: 11, rotation: -12 },
  },
  {
    id: "evidence",
    name: "Регистрация сыщиков",
    popupId: "registration",
    zIndex: 11,
    desktop: { left: 36, top: 58, width: 10, rotation: 12 },
    mobile: { left: 72, top: 74, width: 15, rotation: 12 },
  },
  {
    id: "newspaper",
    name: "Газетная вырезка",
    popupId: "newspaper",
    zIndex: 11,
    desktop: { left: 65, top: 40, width: 17, rotation: -5 },
    mobile: { left: 68, top: 38, width: 22, rotation: -5 },
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

export const getItemShadow = (id: string, isHovered: boolean): string => {
  if (isHovered) {
    switch (id) {
      case "note":
        return "drop-shadow(0 16px 25px rgba(0,0,0,0.65))";
      case "phone":
        return "drop-shadow(0 0 20px rgba(196, 140, 70, 0.55)) drop-shadow(0 28px 44px rgba(0,0,0,0.85))";
      case "map":
        return "drop-shadow(0 18px 28px rgba(0,0,0,0.6))";
      case "dossier":
        return "drop-shadow(0 30px 48px rgba(0,0,0,0.85))";
      case "clock":
        return "drop-shadow(0 14px 22px rgba(0,0,0,0.65))";
      case "suspect-1":
      case "suspect-2":
        return "drop-shadow(0 12px 20px rgba(0,0,0,0.7))";
      case "evidence":
        return "drop-shadow(0 10px 16px rgba(0,0,0,0.7))";
      case "newspaper":
        return "drop-shadow(0 8px 12px rgba(0,0,0,0.75))";
      default:
        return "drop-shadow(0 15px 25px rgba(0,0,0,0.6))";
    }
  } else {
    switch (id) {
      case "note":
        return "drop-shadow(0 8px 14px rgba(0,0,0,0.55))";
      case "phone":
        return "drop-shadow(0 16px 28px rgba(0,0,0,0.65))";
      case "map":
        return "drop-shadow(0 10px 18px rgba(0,0,0,0.5))";
      case "dossier":
        return "drop-shadow(0 18px 28px rgba(0,0,0,0.7))";
      case "clock":
        return "drop-shadow(0 7px 12px rgba(0,0,0,0.5))";
      case "suspect-1":
      case "suspect-2":
        return "drop-shadow(0 5px 9px rgba(0,0,0,0.6))";
      case "evidence":
        return "drop-shadow(0 4px 7px rgba(0,0,0,0.6))";
      case "newspaper":
        return "drop-shadow(0 2px 4px rgba(0,0,0,0.65))";
      default:
        return "drop-shadow(0 6px 12px rgba(0,0,0,0.5))";
    }
  }
};

export const getPinOffset = (id: string): { left: string; top: string } => {
  let left = id === "phone" ? "30%" : "50%";
  if (id === "clock") {
    left = "54%";
  }
  let top = "-8px";
  if (id === "dossier") {
    top = "14px";
  } else if (id === "phone") {
    top = "18px";
  } else if (id === "evidence") {
    top = "8px";
  } else if (id === "newspaper") {
    top = "8px";
  }
  return { left, top };
};
