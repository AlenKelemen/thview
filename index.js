import { elt } from "./util";

const header = elt("h1", {}, "Mjerenja na vodoopskrbnoj mreži");
document.body.appendChild(header);

const deviceSelector = elt("select", {});
const valuesSelector = elt("select", {});

const fielset = elt(
  "fieldset",
  {},
  elt("label", {}, "Odaberi uređaj"),
  deviceSelector,
  elt("label", {}, "Izmjereno"),
  valuesSelector
);
const form = elt("form", {}, fielset);
document.body.appendChild(form);

fetch("https://gis.edc.hr/imagisth/threport/device?info_id=eq.2")
  .then((response) => response.json())
  .then((data) => {
    for (const i of data) {
      deviceSelector.options.add(new Option(i.device_name, i.device_id));
    }
  });
deviceSelector.addEventListener("change", (evt) => {
  const deviceId = evt.target.value;
  valuesSelector.length = 0;
  fetch(
    "https://gis.edc.hr/imagisth/threport/pressure_th?device_id=eq." + deviceId
  )
    .then((response) => response.json())
    .then((data) => {
        
      for (const i of data) {
        console.log(i);
        
        valuesSelector.options.add(
          new Option(i.date_part + ":" + i.pressure)
        );
      }
    });
  /*  fetch("https://gis.edc.hr/imagisth/threport/flow_th?device_id=eq." + deviceId)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      //valuesSelector.length=0;
      //valuesSelector.options.add(new Option(data));
    }); */
});
