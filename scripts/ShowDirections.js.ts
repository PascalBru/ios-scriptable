import { LOG_LEVEL, log, logJSON } from "scripts/utils/debug-utils";
import { getFile } from "scripts/utils/file-utils"
import { decodePolyline, Direction, encodePolyline, GPSPoint } from "scripts/utils/gps"
import { url_maps_path } from "scripts/utils/google-maps-utils"

const logLevel: number = LOG_LEVEL.DEBUG;
const VERSION = "0.1";

const google_api_key = `__google_api_key__`

log(LOG_LEVEL.INFO, logLevel, 'start script (' + module.filename + '/' + VERSION + '): ' + args.widgetParameter)

let points: GPSPoint[] = [];
let data: Data = await getFile('radar-config.json');
let data_json: Direction = JSON.parse(data.toRawString());
logJSON(LOG_LEVEL.DEBUG, logLevel, 'data from json: ', data_json);

data_json.directions.forEach((d, i) => {
    let tmp_points: GPSPoint[] = decodePolyline(d.polyline);
    points = points.concat(i % 2 ? tmp_points : tmp_points.reverse());
});

logJSON(LOG_LEVEL.DEBUG, logLevel, 'points for polyline', points);
let path: string = encodeURI(encodePolyline(points));
let maps_path: string = url_maps_path({google_api_key: google_api_key, screen: Device.screenSize(), path: path});
log(LOG_LEVEL.INFO, logLevel, maps_path);
WebView.loadURL(maps_path, undefined, true);