import { LOG_LEVEL, log, logJSON } from "scripts/utils/debug-utils";
import { writeFile } from "scripts/utils/file-utils";
import { InputTextAlert, QuestionAlert } from "scripts/components/alert-helper";
import { decodePolyline, Direction, DirectionPolyline, distance, encodePolyline, GPSPoint } from "scripts/utils/gps";
import { url_maps_path } from "scripts/utils/google-maps-utils";

const logLevel: number = LOG_LEVEL.DEBUG;
const VERSION = "0.1";

const google_api_key = `__google_api_key__`

interface DPlace {
    origin: string;
    dest: string;
}

//48.28248,11.6694613 48.3498992,11.7719452
const dirUrl = ({origin= '', dest= ''}: DPlace) => `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&alternatives=true&key=${google_api_key}`

log(LOG_LEVEL.INFO, logLevel, 'start script (' + module.filename + '/' + VERSION + '): ' + args.widgetParameter)

const ap = {
    title: 'Direction Input',
    message: 'Insert start and end place',
    inputFields: ['start', 'end'],
}

let a: InputTextAlert = new InputTextAlert(logLevel, ap);
let v: string[] = await a.present().then(r => { return r}, err => {console.log('error in InputTextAlert: '+err); return [];});

const request = new Request(dirUrl({origin: encodeURI(v[0]), dest: encodeURI(v[1])}))
const data = await request.loadJSON().then(r => {return r}, err => console.log('error in loadJSON: '+err));
//logJSON(LOG_LEVEL.DEBUG, logLevel, 'data from google', data)
let json: Direction = {start: {latitude: 0, longitude: 0}, end: {latitude: 0, longitude: 0}, directions: [] };
let directions: DirectionPolyline[] = [];
let points: GPSPoint[] = [];
if(data.status == 'OK'){
    data.routes.forEach((r, i) => {
        log(LOG_LEVEL.INFO, logLevel, 'start: '+r.legs[0].start_location.lat+','+r.legs[0].start_location.lng+
        ' end: '+r.legs[0].end_location.lat+','+r.legs[0].end_location.lng)
        log(LOG_LEVEL.INFO, logLevel, r.summary+': '+r.overview_polyline.points)
        json.start = {latitude: r.legs[0].start_location.lat, longitude: r.legs[0].start_location.lng};
        json.end = {latitude: r.legs[0].end_location.lat, longitude: r.legs[0].end_location.lng};

        let max_distance = 0;
        let tmp_points: GPSPoint[] = decodePolyline(r.overview_polyline.points);
        for (var ip = 1; ip < tmp_points.length; ip++) {
            var d = distance(tmp_points[ip - 1].latitude, tmp_points[ip - 1].longitude, tmp_points[ip].latitude, tmp_points[ip].longitude, 'K');
            max_distance = Math.max(max_distance, d);
        }

        directions.push({name: r.summary, polyline: r.overview_polyline.points, max_distance: max_distance });
        points = points.concat(i % 2 ? tmp_points : tmp_points.reverse());
    });
    json.directions = directions;

    const qap = {
        title: 'Write',
        message: 'Should I write the directions?',
    }
    let qa: QuestionAlert = new QuestionAlert(logLevel, qap);
    if(await qa.present().then( p => {return p}, err => {return false})){
        logJSON(LOG_LEVEL.DEBUG, logLevel, 'json to write', json);
        writeFile('radar-config.json', Data.fromString(JSON.stringify(json, null, 2)));
    }
    logJSON(LOG_LEVEL.DEBUG, logLevel, 'points for polyline', points);
    let path: string = encodeURI(encodePolyline(points));
    let maps_path: string = url_maps_path({google_api_key: google_api_key, screen: Device.screenSize(), path: path});
    log(LOG_LEVEL.INFO, logLevel, maps_path);
    WebView.loadURL(maps_path, undefined, true);
}