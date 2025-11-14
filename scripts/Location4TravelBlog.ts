import { LOG_LEVEL, log, logObject, logJSON } from 'scripts/utils/debug-utils';
import { url_places_search, url_places_search_next, url_place_details } from 'scripts/utils/google-maps-utils';
import { GPSPoint } from 'scripts/utils/gps';

const logLevel: number = LOG_LEVEL.DEBUG;
const VERSION = '0.1';

const google_api_key = `__google_api_key__`;
const radius_nerby = 100;

const tb_file = 'map-vietnam-2024.yml'
const tb_text = (t: IPOIText) => `- title: ${t.title}
  type: ${t.type}
  location:
    latitude: ${t.gps.latitude}
    longitude: ${t.gps.longitude}
`;

export interface IPOIText {
    title: string;
    type: string;
    gps: GPSPoint;
}

log(LOG_LEVEL.INFO, logLevel, 'start script (' + module.filename + '/' + VERSION + '): ' + args.widgetParameter);

const table = new UITable();

function showPlaces(){
    const headline = new UITableRow();
    headline.isHeader = true;
    let cellN = headline.addText('Name');
    cellN.widthWeight = 150;
    let cellI = headline.addText('Icon');
    cellI.widthWeight = 50;
    table.addRow(headline);

    if (placesSearchResults != undefined){
        placesSearchResults.forEach(r => {
            // logJSON(LOG_LEVEL.DEBUG, logLevel, '', r);
            let tr = new UITableRow();
            tr.height = 55;
            tr.dismissOnSelect = false;
            tr.onSelect = () => {
                loadDetails(r);
            };
            cellN = tr.addText(r.name, r.types.join(' '));
            cellN.widthWeight = 150;
            cellI = tr.addImageAtURL(r.icon)
            cellI.widthWeight = 50;
            table.addRow(tr);
        });
        if (placesSearchNextResults != undefined){
            let loadMoreDateRow = new UITableRow();
            table.addRow(loadMoreDateRow);
            let selMoreDataButton = loadMoreDateRow.addButton('load more places');
            selMoreDataButton.onTap = async () => {
                await loadPlacesSearchNext();
            };
        }

        table.reload();
    }
}

async function loadPlacesSearchNext(){
    log(LOG_LEVEL.INFO, logLevel, 'start load of places search next');
    const request = new Request(url_places_search_next({google_api_key: google_api_key, pagetoken: dataPlacesSearch.next_page_token}))
    dataPlacesSearch = await request.loadJSON().then(r => {return r}, err => console.log('error in loadJSON: '+err));
    logJSON(LOG_LEVEL.DEBUG, logLevel, 'places_search_next: ', dataPlacesSearch);
    if(dataPlacesSearch != null){
        dataPlacesSearch.results.forEach(r => {
            placesSearchResults.push(r); 
        });
        placesSearchNextResults = dataPlacesSearch.next_page_token;
        if(placesSearchResults != undefined){
            table.removeAllRows();
            showPlaces();
            table.reload();
        }
    }
}

async function loadDetails (poi){
    logJSON(LOG_LEVEL.INFO, logLevel, 'loadDetails: ', poi);
    let poi_gps : GPSPoint = {latitude: poi.geometry.location.lat, longitude: poi.geometry.location.lng};

    const request = new Request(url_place_details({google_api_key: google_api_key, place_id: poi.place_id}))
    const dataPlace = await request.loadJSON().then(r => {return r}, err => console.log('error in loadJSON: '+err));
    logJSON(LOG_LEVEL.DEBUG, logLevel, 'place_details: ', dataPlace);

    table.removeAllRows();
    let headline = new UITableRow();
    headline.isHeader = true;
    headline.addText(dataPlace.result.name);
    table.addRow(headline);
    let types = new UITableRow();
    types.addText(poi.types.join(' '));
    table.addRow(types);
    let address = new UITableRow();
    address.addText(dataPlace.result.formatted_address);
    table.addRow(address);
    let websiteRow = new UITableRow();
    let websiteButton = websiteRow.addButton(dataPlace.result.website);
    websiteButton.onTap = () => {
        Safari.openInApp(dataPlace.result.website);
    };
    table.addRow(websiteRow);
    let mapRow = new UITableRow();
    let mapButton = mapRow.addButton('Google Maps');
    mapButton.onTap = () => {
        Safari.openInApp(dataPlace.result.url);
    };
    table.addRow(mapRow);
    table.addRow(new UITableRow());
    let okRow = new UITableRow();
    table.addRow(okRow);
    let okButton = okRow.addButton('Append');
    okButton.dismissOnTap = true;
    okButton.onTap = () => {
        log(LOG_LEVEL.INFO, logLevel, 'append poi to '+ tb_file);
        let callback = new CallbackURL('textastic://x-callback-url/append');
        callback.addParameter('location', 'iCloud');
        callback.addParameter('name', tb_file);
        callback.addParameter('text', tb_text({title: dataPlace.result.name, type: poiType[alertR], gps: poi_gps }) )
        callback.open();
    };
    let selAgainRow = new UITableRow();
    table.addRow(selAgainRow);
    let selAgainButton = okRow.addButton('Select Again');
    selAgainButton.onTap = () => {
        table.removeAllRows();
        showPlaces();
    };
    let cancelRow = new UITableRow();
    table.addRow(cancelRow);
    
    table.reload();
    return;
}

// get actual GPS Position
let location = await Location.current();
log(LOG_LEVEL.DEBUG, logLevel, 'location: '+ location);
logObject(LOG_LEVEL.DEBUG, logLevel, location);

const alert = new Alert();
const poiType = ['POI', 'POI-ED', 'POI-PT', 'POI-Divers', 'POI-Wine'];
alert.title = 'POI Art';
alert.message = 'Um was für einen POI handelt es sich?';
poiType.forEach(e => {
    alert.addAction(e)
});
alert.addCancelAction('Cancel')
let alertR = await alert.present();

let dataPlacesSearch: any;
let placesSearchResults: Array<any> = [];
let placesSearchNextResults: string | undefined = undefined;

if(alertR != -1){
    log(LOG_LEVEL.INFO, logLevel, 'selected ' + alertR + ' value: ' + poiType[alertR])
    let gps : GPSPoint = {latitude: location.latitude, longitude: location.longitude};
    let request = new Request(url_places_search({google_api_key: google_api_key, act_gps: gps, radius: radius_nerby}))
    dataPlacesSearch = await request.loadJSON().then(r => {return r}, err => console.log('error in loadJSON: '+err));
    logJSON(LOG_LEVEL.DEBUG, logLevel, 'places_search: ', dataPlacesSearch);
    if(dataPlacesSearch != null){
        placesSearchResults = dataPlacesSearch.results;
        placesSearchNextResults = dataPlacesSearch.next_page_token;
        if(placesSearchResults != undefined){
            showPlaces();
            table.present(true);
        }
    }
}
Script.complete();