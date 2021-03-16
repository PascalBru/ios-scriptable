import { GPSPoint } from "scripts/utils/gps"

export interface IMapsRadar {
    google_api_key: string;
    screen: Size;
    radar: GPSPoint[];
}

export interface IMapsCenterRadar extends IMapsRadar{
    center: GPSPoint;
    zoom: number;
}

export interface IMapsEncPath {
    google_api_key: string;
    screen: Size;
    path: string;
}

// map with multiple markers (centered automatically)
export const url_map = (m: IMapsRadar) => `https://maps.googleapis.com/maps/api/staticmap?size=${m.screen.width}x${m.screen.height}&markers=${combineMarkers(m.radar)}&key=${m.google_api_key}`

// map with multiple markers (center with own value)
export const url_map_center = (m: IMapsCenterRadar) => `https://maps.googleapis.com/maps/api/staticmap?center=${m.center.latitude},${m.center.longitude}&zoom=${m.zoom}&size=${m.screen.width}x${m.screen.height}&markers=${combineMarkers(m.radar)}&key=${m.google_api_key}`

// map with path
export const url_maps_path = (m: IMapsEncPath) => `https://maps.googleapis.com/maps/api/staticmap?size=${m.screen.width}x${m.screen.height}&path=enc:${m.path}&key=${m.google_api_key}`

function combineMarkers(markers: GPSPoint[]){
    let ret = '';
    markers.forEach(m => {
        ret += ''+m.latitude+','+m.longitude+'%7C'
    })
    return ret;
}