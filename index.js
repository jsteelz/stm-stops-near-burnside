const path = require('path');
const fs = require('fs');
const turf = require('@turf/turf');
const Papa = require('papaparse');

/**
 * Using the STM GTFS, downloaded from this URL: https://www.stm.info/sites/default/files/gtfs/gtfs_stm.zip
 * and unzipped and put in the folder STM_GTFS_FOLDER, export a list of the stop_ids within a RADIUS of burnside
 */

const STM_GTFS_FOLDER = path.join('.', 'gtfs_stm');
const STOPS_TXT = 'stops.txt'; // the GTFS file containing stop information for the STM system
const RADIUS = 500; // in meters

// turf takes coords in [lon, lat] format
const BURNSIDE_LAT_LON = [-73.574471, 45.504476];

fs.readFile(path.join(STM_GTFS_FOLDER, STOPS_TXT), 'utf8', (err, file) => {
  if (err) throw new Error('could not read stm stops.txt. check that the file is in the correct location and valid');

  const { data } = Papa.parse(file, { skipEmptyLines: true, header: true });
  const stopInformation = getStopsNearBurnside(data);
  fs.writeFile('stops_near_mcgill.json', JSON.stringify(stopInformation), (err) => {
    if (err) throw new Error('could not write out stm data');
  });
});

function getStopsNearBurnside(stopsAsJson) {
  return stopsAsJson.map((s) => ({
    stop_id: s.stop_id,
    stop_code: s.stop_code,
    stop_lat: s.stop_lat,
    stop_lon: s.stop_lon,
    stop_name: s.stop_name
  })).filter(s => {
    return (s.stop_lon && s.stop_lat) ? turf.distance(turf.point([s.stop_lon, s.stop_lat]), turf.point(BURNSIDE_LAT_LON), { units: 'meters'}) < RADIUS : false;
  });
}