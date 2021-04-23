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
const report = elt("p", { style: "margin-bottom:0" }, "Preuzimanje mjerenja...");//
const download = elt(
  "a",
  {
    style: "display:inline-block;display:none",
    href: "data:text/plain;charset=utf-8," + encodeURIComponent(""),
    download: "Mjerenja.csv",
  },
  "Preuzmi mjerenja lokalno"
);
const tbody = elt("tbody", {});
const tbl = elt(
  "table",
  {style:'display:none'}, //
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
  report,
  download,
  tbl
);
const form = elt("form", {}, fielset);
document.body.appendChild(form);
const deviceId = deviceSelector.value;

/* Device selector options
fetch("https://gis.edc.hr/imagisth/threport/device?info_id=eq.2")
  .then((response) => response.json())
  .then((data) => {
    for (const i of data) {
      const o = new Option(i.device_name, i.device_id);
      deviceSelector.options.add(o);
    }
  });
  deviceSelector.addEventListener("change", evt => deviceSelectorChanged())
*/

deviceSelectorChanged();
function deviceSelectorChanged() {
  const pressurePromise = fetch(
    "https://gis.edc.hr/imagisth/threport/pressure_th_mt?device_id=eq." +
      deviceId
  );
  const flowPromise = fetch(
    "https://gis.edc.hr/imagisth/threport/flow_th_mt_m3?device_id=eq." +
      deviceId
  );
  Promise.all([pressurePromise, flowPromise]).then((r) => {
    Promise.all([r[0].json(), r[1].json()]).then((r) => {
      tbl.style.display ='table';
      download.style.display='block';
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
        value.date_taken = moment(value.date_taken).add(2,'hour')//!Needs correction on server side!
        
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
      ts[0].flow = ts[1].flow; //!fake! ts[0].flow to be removed from db
      //console.log(period(ts));
      startDate.addEventListener("change", (evt) => {
        const p = period(ts);
        paint(p);
        //console.log(p);
      });
      endDate.addEventListener("change", (evt) => {
        const p = period(ts);
        paint(p);
        //console.log(p);
      });
      const p = period(ts);
      paint(p);
      download.href = download.href + encodeURIComponent(csv(p));
      
    });
  });
}
function csv(r) {
  //values as csv text
  let s = "Datum;Vrijeme;Tlak bar;Protok l/s\n";
  for (const value of r.values) {
    if (value) {
      let pstring = value.pressure.toFixed(2);
      pstring = pstring.replace('.',',');
      let fstring = value.flow.toFixed(2);
      fstring= fstring.replace('.',',');
      s += `${value.timestamp.format("DD.MM.YYYY")};${value.timestamp.format("HH:mm:ss")};${pstring};${fstring}\n`;
    }
  }
  return s;
}
function paint(r) {
  //paint values to html table
  tbody.innerHTML = "";
  for (const value of r.values) {
    if (value) {
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
  const r = { values: [], report: "" };
  if (moment(startDate.value) >= moment(endDate.value)) {
    r.report = "Početni datum i vrijeme moraju biti ranije.";
  } else {
    for (const value of val) {
      if (
        value.timestamp > moment(startDate.value) &&
        value.timestamp < moment(endDate.value)
      ) {
        r.values.push(value);
      }
    }
    r.report = `Nađeno je ${r.values.length} mjerenja.`;
  }

  report.innerHTML = r.report;
  return r;
}
