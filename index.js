import { elt } from "./util";
import moment from "moment";

const header = elt("h1", {}, "Mjerenja na vodoopskrbnoj mreži");
document.body.appendChild(header);
const startDate = elt("input", { type: "datetime-local" });
const deviceSelector = elt("select", {});
startDate.value = moment().subtract(1, "days").format("YYYY-MM-DDTHH:mm");
const endDate = elt("input", { type: "datetime-local" });
endDate.value = moment().format("YYYY-MM-DDTHH:mm");
const valuesSelector = elt("select", {});
console.log(endDate.value);
const fielset = elt(
  "fieldset",
  {},
  elt("label", {}, "Odaberi uređaj"),
  deviceSelector,
  elt("label", {}, "Početni datum"),
  startDate,
  elt("label", {}, "Završni datum"),
  endDate,
  elt("label", {}, "Izmjereno"),
  valuesSelector
);
const form = elt("form", {}, fielset);
document.body.appendChild(form);

fetch("https://gis.edc.hr/imagisth/threport/device?info_id=eq.2")
  .then((response) => response.json())
  .then((data) => {
    for (const i of data) {
      const o = new Option(i.device_name, i.device_id);
      deviceSelector.options.add(o);
      if (i.device_id === 177) o.selected = true;
    }
  });
const deviceSelectorChanged = (evt) => {
  const deviceId = evt.target.value;
  valuesSelector.length = 0;
  fetch(
    "https://gis.edc.hr/imagisth/threport/pressure_th?device_id=eq." + deviceId
  )
    .then((response) => response.json())
    .then((data) => {
      const startUnixDate = moment(startDate.value).unix();
      const endUnixDate = moment(endDate.value).unix();
      console.log(startUnixDate);
      for (const i of data) {
        console.log(i.date_part);
      }
    });
};
deviceSelector.addEventListener("change", deviceSelectorChanged);
