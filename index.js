import { elt } from "./util";
import moment from "moment";

const header = elt(
  "h1",
  { style: "margin-top:0;margin-left:1rem" },
  "Mjerenja na vodoopskrbnoj mreži"
);
document.body.appendChild(header);
const startDate = elt("input", { type: "datetime-local" });
const deviceSelector = elt("select", {});
startDate.value = moment().subtract(1, "days").format("YYYY-MM-DDTHH:mm");
const endDate = elt("input", { type: "datetime-local" });
endDate.value = moment().format("YYYY-MM-DDTHH:mm");
const pressure = elt("select", { size: "10", style: "width:300px" });
const flow = elt("select", { size: "10", style: "width:300px" });

const tblPressure = elt(
  "table",
  {},
  elt(
    "thead",
    {},
    elt("tr", {}, elt("td", {}, "Vrijeme"), elt("td", {}, "Tlak bar"))
  )
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
  elt("label", {}, "Tlak bar"),
  pressure,
  //elt('button',{type:'submit',onclick=}, 'Preuzmi'),
  elt("label", {}, "Protok l/s"),
  flow,

);
const form = elt("form", {}, fielset);
document.body.appendChild(form);
document.body.appendChild(  tblPressure)
fetch("https://gis.edc.hr/imagisth/threport/device?info_id=eq.2")
  .then((response) => response.json())
  .then((data) => {
    for (const i of data) {
      const o = new Option(i.device_name, i.device_id);
      deviceSelector.options.add(o);
      if (i.device_id === 161) o.selected = true;
    }
    deviceSelectorChanged();
  });

const deviceSelectorChanged = () => {
  const deviceId = deviceSelector.value;
  pressure.length = 0;
  fetch(
    "https://gis.edc.hr/imagisth/threport/pressure_th?device_id=eq." + deviceId
  )
    .then((response) => response.json())
    .then((data) => {
      let report = "Tlak bar\n";
      const startUnixDate = moment(startDate.value).unix();
      const endUnixDate = moment(endDate.value).unix();
      for (const i of data) {
        if (i.date_part >= startUnixDate && i.date_part <= endUnixDate) {
          const timeString = moment.unix(i.date_part).format("L LT");
          const o = new Option(timeString + " => " + i.pressure);
          pressure.options.add(o);
          report = report + timeString + ";" + i.pressure + "\n";
          tblPressure.appendChild(elt('tr',{}, elt('td',{},timeString),elt('td',{},i.pressure + '')))
        }
      }
      console.log(report);
    });
  flow.length = 0;
  fetch("https://gis.edc.hr/imagisth/threport/flow_th?device_id=eq." + deviceId)
    .then((response) => response.json())
    .then((data) => {
      let report = "Protok l/s\n";
      const startUnixDate = moment(startDate.value).unix();
      const endUnixDate = moment(endDate.value).unix();
      for (const i of data) {
        if (i.date_part >= startUnixDate && i.date_part <= endUnixDate) {
          const timeString = moment.unix(i.date_part).format("L LT");
          const o = new Option(timeString + " => " + i.flow);
          flow.options.add(o);
        }
      }
    });
};

deviceSelector.addEventListener("change", deviceSelectorChanged);
startDate.addEventListener("change", deviceSelectorChanged);
endDate.addEventListener("change", deviceSelectorChanged);
