export function calculateCoverCoords(
  x: number,
  y: number,
  w: number,
  h: number,
  boardWidth: number,
  boardHeight: number
): { left: string; top: string; width: string; height: string } {
  if (boardWidth === 0 || boardHeight === 0) {
    return {
      left: `${(x / 1385.92) * 100}%`,
      top: `${(y / 773.53) * 100}%`,
      width: `${(w / 1385.92) * 100}%`,
      height: `${(h / 773.53) * 100}%`,
    };
  }
  const W_i = 1385.92;
  const H_i = 773.53;
  const R_i = W_i / H_i;
  const R_c = boardWidth / boardHeight;

  let W_scaled = 0;
  let H_scaled = 0;
  let offset_x = 0;
  let offset_y = 0;

  if (R_c > R_i) {
    W_scaled = boardWidth;
    H_scaled = boardWidth / R_i;
    offset_x = 0;
    offset_y = (boardHeight - H_scaled) / 2;
  } else {
    H_scaled = boardHeight;
    W_scaled = boardHeight * R_i;
    offset_x = (boardWidth - W_scaled) / 2;
    offset_y = 0;
  }

  const left = offset_x + (x / W_i) * W_scaled;
  const top = offset_y + (y / H_i) * H_scaled;
  const width = (w / W_i) * W_scaled;
  const height = (h / H_i) * H_scaled;

  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
  };
}
