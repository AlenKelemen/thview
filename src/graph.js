import Chart from "chart.js";
import { elt } from "./util";

export function graph() {
  const canvas = elt("canvas", { height: "100%", width: "100%" });
  const ctx = canvas.getContext("2d");
  //const graph = new Chart();
  return canvas;
}
