import { elt } from "./util";
import moment from "moment";

const header = elt(
  "h1",
  { style: "margin-top:0;margin-left:1rem" },
  "Mjerenja na vodoopskrbnoj mreži"
);
document.body.appendChild(header);
const startDate = elt("input", { type: "datetime-local" });
const deviceSelector = elt(
  "select",
  {},
  elt("option", { value: "177" }, "Korčula 1")
);
startDate.value = moment().subtract(1, "days").format("YYYY-MM-DDTHH:mm");
const endDate = elt("input", { type: "datetime-local" });
endDate.value = moment().format("YYYY-MM-DDTHH:mm");
const tbody = elt("tbody", {});
const tbl = elt(
  "table",
  {}, //suppress 100%
  elt(
    "thead",
    {},
    elt(
      "tr",
      {},
      elt("th", {}, "Datum"),
      elt("th", {}, "Vrijeme"),
      elt("th", {}, "Tlak bar"),
      elt("th", {}, "Protok l/s")
    )
  ),
  tbody
);
const fielset = elt(
  "fieldset",
  { style: "margin-left:1em" },
  elt("label", {}, "Odaberi uređaj"),
  deviceSelector,
  elt("label", {}, "Početni datum i vrijeme"),
  startDate,
  elt("label", {}, "Završni datum i vrijeme"),
  endDate,
  tbl
);
const form = elt("form", {}, fielset);
document.body.appendChild(form);
const deviceId = deviceSelector.value;
const pressurePromise = fetch(
  "https://gis.edc.hr/imagisth/threport/pressure_th_mt?device_id=eq." + deviceId
);
const flowPromise = fetch(
  "https://gis.edc.hr/imagisth/threport/flow_th_mt_m3?device_id=eq." + deviceId
);
function paint(val) {
  //paint values to html table
  tbody.innerHTML ='';
  for (const value of val) {
   if(value){
    tbody.appendChild(
      elt(
        "tr",
        {},
        elt("td", {}, value.timestamp.format("DD.MM.YYYY")),
        elt("td", {}, value.timestamp.format("HH:mm:ss")),
        elt("td", {}, value.pressure.toFixed(2)),
        elt("td", {}, value.flow.toFixed(2))
      )
    );
   } 
  }
}
function period(val) {
  //return values inside period of time
  const r = [];
  for (const value of val) {
    if (
      value.timestamp > moment(startDate.value) &&
      value.timestamp < moment(endDate.value)
    ) {
      r.push(value);
    }
  }
  return r;
}
Promise.all([pressurePromise, flowPromise]).then((r) => {
  Promise.all([r[0].json(), r[1].json()]).then((r) => {
    const ps = r[0];
    const fs = r[1];
    const t = [],
      ts = [];
    for (const [index, value] of ps.entries()) {
      delete value.device_id;
      // skip first flow item
      value.flow =
        index === 0
          ? null
          : fs.find((x) => x.date_taken === value.date_taken).m3;
      //local date
      value.date_taken = moment(value.date_taken).local();
      t.push(value);
    }
    //recalculate flow
    for (let i = 1; i < t.length; i++) {
      ts[i - 1] = {
        timestamp: t[i].date_taken,
        pressure: t[i].pressure,
        flow: ((t[i].flow - t[i - 1].flow) * 4) / 3.6,
      };
    }
    ts[0].flow = ts[1].flow; //!fake! ts[0].flow
    console.log(period(ts));
    startDate.addEventListener("change", evt => paint(period(ts)));
    endDate.addEventListener("change", evt => paint(period(ts)));
    paint(period(ts));
  });
});
