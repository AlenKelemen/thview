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
const tbodyPressure = elt("tbody", {});
const tblPressure = elt(
  "table",
  {}, //suppress 100%
  elt(
    "thead",
    {},
    elt("tr", {}, elt("th", {}, "Vrijeme"), elt("th", {}, "Tlak bar"))
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
    elt("tr", {}, elt("th", {}, "Vrijeme"), elt("th", {}, "Protok l/s"))
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
  //
  if (deviceId == 177) {
    inventia();
    return;
  }
  //
  fetch(
    "https://gis.edc.hr/imagisth/threport/pressure_th?device_id=eq." + deviceId
  )
    .then((response) => response.json())
    .then((data) => {
      let report = "Tlak bar\n";
      tbodyPressure.innerHTML = "";
      const startUnixDate = moment(startDate.value).unix();
      const endUnixDate = moment(endDate.value).unix();
      for (const i of data) {
        if (i.date_part >= startUnixDate && i.date_part <= endUnixDate) {
          const timeString = moment.unix(i.date_part).format("L LT");
          report = report + timeString + ";" + i.pressure + "\n";
          tbodyPressure.appendChild(
            elt(
              "tr",
              {},
              elt("td", {}, timeString),
              elt("td", {}, i.pressure + "")
            )
          );
        }
      }
      console.log(report);
    });
  fetch("https://gis.edc.hr/imagisth/threport/flow_th?device_id=eq." + deviceId)
    .then((response) => response.json())
    .then((data) => {
      let report = "Protok l/s\n";
      tbodyFlow.innerHTML = "";
      const startUnixDate = moment(startDate.value).unix();
      const endUnixDate = moment(endDate.value).unix();
      for (const i of data) {
        if (i.date_part >= startUnixDate && i.date_part <= endUnixDate) {
          const timeString = moment.unix(i.date_part).format("L LT");
          tbodyFlow.appendChild(
            elt("tr", {}, elt("td", {}, timeString), elt("td", {}, i.flow + ""))
          );
        }
      }
    });
};

deviceSelector.addEventListener("change", deviceSelectorChanged);
startDate.addEventListener("change", deviceSelectorChanged);
endDate.addEventListener("change", deviceSelectorChanged);

//Inventia MT testing https://gis.edc.hr/imagisth/threport/mt_flow_test
function inventia() {
  console.log("Inventia test");

  fetch("https://gis.edc.hr/imagisth/threport/mt_flow_test")
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      tbodyPressure.innerHTML = "";
      let report = "Protok l/s\n";
      tbodyFlow.innerHTML = "";
      const startUnixDate = moment(startDate.value).unix();
      const endUnixDate = moment(endDate.value).unix();
      for (const i of data) {
        if (i.date >= startUnixDate && i.date <= endUnixDate) {
          const timeString = moment.unix(i.date).format("L LT");
          tbodyFlow.appendChild(
            elt("tr", {}, elt("td", {}, timeString), elt("td", {}, i.flow + ""))
          );
        }
      }
    });

}
