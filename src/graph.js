import Chart from "chart.js";
import { elt } from "./util";

export function graph(){
    const g = elt("canvas", { height: "100%", width: "100%"});
    const ctx = g.getContext("2d");
    return g;
}
export function graphAddData(data){

}