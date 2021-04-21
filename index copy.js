import { elt } from "./util";
import moment from "moment";

const header = elt(
  "h1",
  { style: "margin-top:0;margin-left:1rem" },
  "Mjerenja na vodoopskrbnoj mreži"
);
document.body.appendChild(header);
const startDate = elt("input", { type: "datetime-local" });
const deviceSelector = elt("select", { disabled: true });
startDate.value = moment().subtract(1, "days").format("YYYY-MM-DDTHH:mm");
const endDate = elt("input", { type: "datetime-local" });
endDate.value = moment().format("YYYY-MM-DDTHH:mm");
const tbodyPressure = elt("tbody", {});
const tblPressure = elt(
  "table",
  {}, //suppress 100%
  elt(
    "thead",
    {},
    elt("tr", {}, elt("th", {}, "Datum Vrijeme"), elt("th", {}, "Tlak bar"))
  ),
  tbodyPressure
);
const tbodyFlow = elt("tbody", {});
const tblFlow = elt(
  "table",
  { style: "width:unset" }, //suppress 100%
  elt(
    "thead",
    {},
    elt("tr", {}, elt("th", {}, "Datum Vrijeme"), elt("th", {}, "Protok l/s"))
  ),
  tbodyFlow
);
const fielset = elt(
  "fieldset",
  { style: "margin-left:1em" },
  elt("label", {}, "Odaberi uređaj"),
  deviceSelector,
  elt("label", {}, "Početni datum"),
  startDate,
  elt("label", {}, "Završni datum"),
  endDate,
  tblPressure,
  tblFlow
);
const form = elt("form", {}, fielset);
document.body.appendChild(form);

fetch("https://gis.edc.hr/imagisth/threport/device?info_id=eq.2")
  .then((response) => response.json())
  .then((data) => {
    for (const i of data) {
      const o = new Option(i.device_name, i.device_id);
      deviceSelector.options.add(o);
      if (i.device_id === 177) o.selected = true; //161
    }
    deviceSelectorChanged();
  });

const deviceSelectorChanged = () => {
  const deviceId = deviceSelector.value;
  fetch(
    "https://gis.edc.hr/imagisth/threport/pressure_th_mt?device_id=eq." +
      deviceId
  )
    .then((response) => response.json())
    .then((data) => {
      let report = "Tlak bar\n";
      tbodyPressure.innerHTML = "";

      for (const i of data) {
        if (
          moment(i.date_taken) >= moment(startDate.value) &&
          moment(i.date_taken) <= moment(endDate.value)
        ) {
          const tl = moment(i.date_taken).local();
          console.log(i.date_taken,tl.format("DD.mm.yyyy hh:mm"), i.pressure);
          tbodyPressure.appendChild(
            elt(
              "tr",
              {},
              elt("td", {}, tl.format("DD.mm.yyyy hh:mm")),
              elt("td", {}, i.pressure + "")
            )
          );
        }
      }
    });
  fetch(
    "https://gis.edc.hr/imagisth/threport/flow_th_mt_m3?device_id=eq." +
      deviceId
  )
    .then((response) => response.json())
    .then((data) => {
      data.shift();
      let report = "Protok l/s\n";
      tbodyFlow.innerHTML = "";
      for (let i = 0; i < data.length; i += 2) {
        if (i > 1) {
          if (
            moment(data[i - 2].date_taken) >= moment(startDate.value) &&
            moment(data[i].date_taken) <= moment(endDate.value)
          ) {
            let t = moment(data[i].date_taken).local();
            let tl = t.format("DD.mm.yyyy hh:mm");
            let f = (((data[i].m3 - data[i - 2].m3) * 4) / 3.6).toFixed(2);
            //console.log(t, f);
            tbodyFlow.appendChild(
              elt("tr", {}, elt("td", {}, tl), elt("td", {}, f + ""))
            );
          }
        }
      }
    });
};

deviceSelector.addEventListener("change", deviceSelectorChanged);
startDate.addEventListener("change", deviceSelectorChanged);
endDate.addEventListener("change", deviceSelectorChanged);
