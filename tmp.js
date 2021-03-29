fetch(
    "https://gis.edc.hr/imagisth/threport/pressure_th?device_id=eq." + deviceId
  )
    .then((response) => response.json())
    .then((data) => {
      const startUnixDate = moment(startDate.value).unix();
      const endUnixDate = moment(endDate.value).unix();
      for (const i of data) {
        if (i.date_part >= startUnixDate && i.date_part <= endUnixDate) {
          const timeString = moment.unix(i.date_part).format('L LT')
          const o = new Option(timeString + " -> " + i.pressure);
          valuesSelector.options.add(o);
        }
      }
    });