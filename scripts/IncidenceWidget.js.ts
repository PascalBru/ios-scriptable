import { LOG_LEVEL, log, logJSON, logTimeDate, logDate } from "scripts/utils/debug-utils";
import { fetchJSONData } from "scripts/utils/request-utils"
import { addTitle, addUpdateFooter, drawContextLine, getWidgetSizeInPoint, IWidgetParams, WidgetHelper } from "./components/widget-helper";
import { round } from "./utils/math";
import { compareDate, diffDays, minusDays, plusDays, sameDay } from "./utils/date-utils";

const logLevel: number = LOG_LEVEL.INFO;
const VERSION = "0.1";

log(LOG_LEVEL.INFO, logLevel, 'start script (' + module.filename + '/' + VERSION + '): ' + args.widgetParameter)

// the RS code for Freising
const default_district_code = '09178'
// number of days to look in the history
const minus_days = 14
// data for different widget sizes
const widgetData = { small: {fontSize: 9, minusHeight: 55, headlineBottom: 40, datePos: 50, round: 1, dateFormat: { day: '2-digit'}},
                     medium: {fontSize: 10, minusHeight: 55, headlineBottom: 40, datePos: 50, round: 2, dateFormat: { day: '2-digit', month: '2-digit'}},
                     large: {fontSize: 12, minusHeight: 55, headlineBottom: 40, datePos: 45, round: 2, dateFormat: { day: '2-digit', month: '2-digit'}}}

// url for the data of an district
const url_district = district_code =>
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=RS=\'${district_code}\'&outFields=*&returnGeometry=false&outSR=4326&f=json`;
// url for the data of the count of case during last x days
const url_district_cases_perday = (district_code, minus_days) =>
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=IdLandkreis=\'${district_code}\'%20AND%20Meldedatum%20%3E%3D%20CURRENT_TIMESTAMP%20-%20INTERVAL%20\'${minus_days}\'%20DAY&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&groupByFieldsForStatistics=Meldedatum&f=json&&orderByFields=Meldedatum&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&resultType=standard&cacheHint=true`;

export interface CasesDay {
    count: number;
    date: Date;
}
export interface IncidenceDay {
    count: number;
    date: Date;
}
export interface IncidenceData {
    data: IncidenceDay[];
    last_update: Date;
}
export interface DistrictData {
    gen: string;
    ewz: number;
}

let district = (args.widgetParameter == null || args.widgetParameter.length == 0) ? default_district_code : args.widgetParameter;

let dd: DistrictData = await fetchJSONData(url_district(district), transformJsonDistrict, errorJsonDistrict)
logJSON(LOG_LEVEL.INFO, logLevel, 'DistrictData', dd)

// get incidence data from API
let d: IncidenceData = await fetchJSONData(url_district_cases_perday(district, minus_days), transformJsonIncidence, errorJsonIncidence)
logJSON(LOG_LEVEL.INFO, logLevel, 'IncidenceData', d)

class IncidenceListWidget extends WidgetHelper {
    createWidget(params: IWidgetParams): Promise<ListWidget> {
        const widget = new ListWidget();
        widget.setPadding(10, 5, 10, 5);
        addTitle(widget, '7-Tage ' + dd.gen)
        let chart = new DrawContext();
        chart.setTextColor( Color.black());
        let s = getWidgetSizeInPoint(params.widgetSize);
        let wd = widgetData[params.widgetSize];
        let spaceIncidence = s.width / 8;
        let countHeightSize = wd.fontSize * 1.5;
        let heightIncidence = s.height - wd.minusHeight - countHeightSize;
        chart.size = s;
        chart.respectScreenScale = true;
        chart.opaque = true;
        chart.setFont(Font.lightMonospacedSystemFont(wd.fontSize));
        chart.setTextAlignedCenter();
        
        // calc data for chart
        let min, max, diff;
        for (let i = 0; i < d.data.length; i++) {
            let aux = d.data[i].count;
            min = (aux < min || min == undefined ? aux : min);
            max = (aux > max || max == undefined ? aux : max);
        }
        diff = max - min;
        let actPoint: Point;
        let previosPoint: Point | undefined = undefined;

        for (let i = 0; i < d.data.length; i++) {
            let dstr = d.data[i].date.toLocaleDateString([], wd.dateFormat);
            let delta = (max - d.data[i].count ) / diff;
            actPoint = new Point(spaceIncidence * (1 + i), wd.headlineBottom + countHeightSize + ((heightIncidence - wd.headlineBottom) * delta))
            // draw vertical lines
            drawContextLine(chart, actPoint, new Point(actPoint.x, heightIncidence + countHeightSize), Color.lightGray(), 1);
            if(previosPoint != undefined){
                let c: Color = d.data[i].count < 50 ? Color.green() : d.data[i].count < 100 ? Color.orange() : Color.red();
                drawContextLine(chart, previosPoint, actPoint, c, 1);
            }
            previosPoint = actPoint
            chart.drawTextInRect('' + round(d.data[i].count, wd.round), new Rect(actPoint.x - 18, actPoint.y - countHeightSize, 40, 25));
            chart.drawTextInRect(dstr, new Rect(actPoint.x - 18, s.height - wd.datePos, 40, 25));
        }

        // add chart to widget
        widget.backgroundImage = chart.getImage();

        addUpdateFooter(widget, d.last_update)
        return new Promise((resolve) => {
            resolve(widget);
        });;
    }
}

// show widget with incidence infos
let rw: IncidenceListWidget = new IncidenceListWidget();
rw.startWidget(logLevel);

// transform the response from the API 
function transformJsonIncidence(data): IncidenceData {
    let cd: CasesDay[] = [];
    let check_date: Date = minusDays(new Date(Date.now()), minus_days - 1);
    data.features.forEach(f => {
        let date = new Date(f.attributes.Meldedatum)
        if (!sameDay(check_date, date)) {
            // fill empty days with 0 cases
            let diff_days = diffDays(check_date, date);
            logTimeDate(LOG_LEVEL.DEBUG, logLevel, 'diff days: ' + diffDays + ' ', check_date);
            for (let i = 0; i < diff_days; i++) {
                cd.push({ count: 0, date: check_date });
                check_date = plusDays(check_date, 1);
            }
        }
        cd.push({ count: parseInt(f.attributes.value), date: date })
        check_date = plusDays(check_date, 1)
        /**let dstr = cd[cd.length - 1].date.toLocaleTimeString([], {
            weekday: 'short', day: '2-digit', month: '2-digit'
        })
        logJSON(LOG_LEVEL.DEBUG, logLevel, dstr + ' f', f)*/
    });
    logJSON(LOG_LEVEL.DEBUG, logLevel, 'CasesDay', cd)
    // check if values exist until yesterday
    let today = new Date(Date.now());
    logTimeDate(LOG_LEVEL.DEBUG, logLevel, 'today', today)
    logTimeDate(LOG_LEVEL.DEBUG, logLevel, 'end date', check_date)
    if(!sameDay(check_date, today)){
        let diff_days = diffDays(check_date, today);
        for (let i = 0; i < diff_days; i++) {
            cd.push({ count: 0, date: check_date });
            check_date = plusDays(check_date, 1);
        }
    }
    // calculate incidence per day
    let id: IncidenceDay[] = [];
    for (let i = cd.length - 1; i >= 6; i--) {
        let sum = cd[i].count;
        for (let j = 1; j < 7; j++) {
            sum += cd[i - j].count;
        }
        let d_id: Date = plusDays(cd[i].date, 1);
        let seven_day_100k = (sum / dd.ewz) * 100000;
        logDate(LOG_LEVEL.DEBUG, logLevel, 'sum: ' + sum + ' incidence: ' + seven_day_100k, d_id, true);
        id.push({count: seven_day_100k, date: d_id})
    }
    id.sort((a, b) => compareDate(a.date, b.date));
    return { data: id, last_update: new Date(Date.now()) };
}

// generate the error JSON if API is not available
function errorJsonIncidence(): IncidenceData {
    return { data: [], last_update: new Date(Date.now()) };
}

function transformJsonDistrict(data): DistrictData {
    // logJSON(LOG_LEVEL.DEBUG, logLevel, 'data district', data)
    return { gen: data.features[0].attributes.GEN, ewz: data.features[0].attributes.EWZ }
}

function errorJsonDistrict(): DistrictData {
    return { gen: '', ewz: -1 }
}