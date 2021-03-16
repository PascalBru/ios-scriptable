import { LOG_LEVEL, log, logJSON } from "scripts/utils/debug-utils";
import { getFile } from "scripts/utils/file-utils"
import { calcCenter, decodePolyline, Direction, distance, GPSPoint } from "scripts/utils/gps"
import { fetchJSONData } from "scripts/utils/request-utils"
import { addStackText, addTextCentered, addTitle, addUpdateFooter, IWidgetParams, WidgetHelper } from "./components/widget-helper";
import { url_map, url_map_center } from "./utils/google-maps-utils";

const logLevel: number = LOG_LEVEL.DEBUG;
const VERSION = "0.1";

const google_api_key = ``

log(LOG_LEVEL.INFO, logLevel, 'start script (' + module.filename + '/' + VERSION + '): ' + args.widgetParameter)

// the list of the pos values (lat / lng)
const pos = [ '48.28248', '11.6694613', '48.3498992','11.7719452'];
//const pos = [ '48.39912072461539', '11.705589294433594' ,'48.51296552999087', '11.894416809082031'];
const pos_center = calcCenter(pos[0], pos[1], pos[2], pos[3]);
const screen = Device.screenSize();

const url_radar = (start:GPSPoint, end:GPSPoint) => `https://cdn2.atudo.net/api/1.0/vl.php?type=0,1,2,3,4,5,6&box=${start.latitude},${start.longitude},${end.latitude},${end.longitude}`;

export interface Radar {
    street: string;
    vmax: string;
    r: GPSPoint;
}
export interface RadarData {
    count: number;
    radars?: Radar[];
    last_update: Date;
}
export interface RouteData {
    max_distance: number;
    points: GPSPoint[];
}

// load directions from json
let routes: RouteData[] = [];
let data: Data = await getFile('radar-config.json');
let data_json: Direction = JSON.parse(data.toRawString());
logJSON(LOG_LEVEL.DEBUG, logLevel, 'data from json: ', data_json);
data_json.directions.forEach(d =>{
    routes.push({max_distance: d.max_distance, points: decodePolyline(d.polyline)});
});

// get radar data from API
let d: RadarData = await fetchJSONData(url_radar(data_json.start, data_json.end), transformJson, errorJson)
logJSON(LOG_LEVEL.DEBUG, logLevel, 'radars', d)

class RadarListWidget extends WidgetHelper {
    createWidget(params: IWidgetParams): Promise<ListWidget> {
        const widget = new ListWidget();
        widget.setPadding(10, 5, 10, 5);
        addTitle(widget, 'Radar')

        if(d.count < 0){
            addTextCentered(widget, 'keine Daten 🛑');
        }
        else if (d.count == 0){
            addTextCentered(widget, 'freie Fahrt 🚀');
        }
        else if(d.radars != undefined){
            let radar_pos: GPSPoint[] = [];
            d.radars.forEach(e => {
                radar_pos.push(e.r);
                let mapurl = url_map({google_api_key: google_api_key, screen: Device.screenSize(), radar: [e.r]});
                if (params.widgetSize != 'small' && e.vmax != ''){
                    addStackText(widget, e.street, '🚔 '+e.vmax+' km/h', mapurl);
                }
                else{
                    addStackText(widget, e.street, '', mapurl);
                }
            });
            widget.url = url_map({google_api_key: google_api_key, screen: Device.screenSize(), radar: radar_pos});
            log(LOG_LEVEL.DEBUG, logLevel, widget.url);
        }
        else {
            addTextCentered(widget, 'error with data');
        }

        addUpdateFooter(widget, d.last_update)
        return new Promise((resolve) => {
            resolve(widget);
        });;
    }
}

// show widget with radar infos
let rw: RadarListWidget = new RadarListWidget();
rw.startWidget(logLevel);

// transform the response from the API and check if radar is on route
function transformJson(data): RadarData {
    let count = 0;
    let radars : Radar[] = [];
    if (data.pois == undefined) {
        count = -1;
    }
    else {
        data.pois.forEach(entry => {
            if(onRoute(entry)){
                count++;
                radars.push({street: entry.street, vmax: entry.vmax, r: {latitude: entry.lat, longitude: entry.lng}});
            }
        });
        /**const testentry = {"id":"12345", "street":"Test PB", "lat": 48.314251, "lng": 11.689430, "vmax":"50"}
        if(onRoute(testentry)){
            count++;
            radars.push({street: testentry.street, vmax: testentry.vmax, r: {latitude: testentry.lat, longitude: testentry.lng}});
        }*/
    }
    log(LOG_LEVEL.INFO, logLevel, 'Anzahl: '+count);
    log(LOG_LEVEL.INFO, logLevel, ''+radars);
    return { count: count, radars: radars, last_update: new Date(Date.now()) };
}

// generate the error JSON if API is not available
function errorJson(): RadarData {
    return { count: -2, last_update: new Date(Date.now()) };
}

// check if radar is part of the route
function onRoute(entry): boolean {
    logJSON(LOG_LEVEL.DEBUG, logLevel, 'radar to check', entry);
    for (let i = 0; i < routes.length; i++) {
        const r = routes[i];
        for (let j = 0; j < r.points.length; j++) {
            const p = r.points[j];
            var d = distance(p.latitude, p.longitude, entry.lat, entry.lng, 'K');
            if (d <= r.max_distance) {
                logJSON(LOG_LEVEL.INFO, logLevel, "radar on route", entry);
                return true;
            }
        }
    }
    return false;
}