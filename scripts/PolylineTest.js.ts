import { LOG_LEVEL, log, logJSON } from "scripts/utils/debug-utils";
import { decodePolyline, distance } from "scripts/utils/gps";
import { IWidgetParams, WidgetHelper } from "scripts/components/widget-helper"

const logLevel: number = LOG_LEVEL.INFO;
const VERSION = "0.1";

log(LOG_LEVEL.INFO, logLevel, 'start script (' + module.filename + '/' + VERSION + '): ' + args.widgetParameter)


let radar = [{ lat: 48.314251, lng: 11.689430 }, { lat: 58.314251, lng: 10.689430 }]

let poly = 'qeueHmeffAIdAIz@]rC';
let poly2 = 'qeueHmeffAS`C]rCfBj@dA_KRaBb@oFNyBLc@HYz@cAVmCVo@NWLIpAw@l@_@tAk@jBa@o@oAmAaCw@yAm@o@i@[g@ImAIuGi@oE_@OIcEk@u@IG@qDu@cAUyAc@}GcCgOsF}@[YKMMo@UoAe@oCcAkBs@a@GeBs@wE}AaFyA{Cs@yDu@yIsAaJmAqG_AgFy@kDy@cFaBaK}D_^sNyHeD_CaAqBs@{@a@}@g@gH}CcEyAcAYo@M}F{@{Ca@iK{AQIwAY}ASkAOS?wCe@cFw@OI}@OeDs@{Bu@u@]w@c@eBoAwAiAgE_EkCsC{BiCsCaDQSIYIYEm@Cs@Fc@Bk@Dw@?q@Eq@Ic@Ma@Wc@[Si@O}@I_@M_@]_@o@Uu@_@_Bc@iB]kAo@eBM_@SOo@uBuAiEu@wBuBeFeCoFo@oA}AsCsAyBeDwE_EaF}CmDwB{BuEiFgAoA}ByCuB{CcC}DcAiBmCqFaDsHSoAmA{DcAeDoA_De@eAwCeG_C}E{@gCg@oBY{ASyA[yDKcE@kBNyD`@yIFyC@mEEeD}Ake@IyBw@mWy@qUTw@JgAF{@?oAUkEk@_LWiH?kAE_DSyG?iADQPM\\I~@IPAhAM\\RPTFJDpAHj@FjBC|@Of@SXMFUBOCOGOQKUGUEi@_@qLq@qR@gAJyAFy@AeAcAeZ[wKQ_G@UFYPWLEhBO`@BDFLVHn@F~A`Fi@';

let max_d = 0;

let points = decodePolyline(poly2);
logJSON(LOG_LEVEL.DEBUG, logLevel, '', points);

interface RadarGPSPoint {
    lat: number;
    lng: number
}

let onRoute: RadarGPSPoint[] = []

for (var i = 1; i < points.length; i++) {
    var d = distance(points[i - 1].latitude, points[i - 1].longitude, points[i].latitude, points[i].longitude, 'K');
    max_d = Math.max(max_d, d);
    log(LOG_LEVEL.DEBUG, logLevel, JSON.stringify(points[i-1])+' '+JSON.stringify(points[i])+' d: '+d);
}
log(LOG_LEVEL.INFO, logLevel, 'max distance polyline: '+max_d);
for (var j = 0; j < radar.length; j++) {
    for (var i = 1; i < points.length; i++) {
        var d = distance(points[i - 1].latitude, points[i - 1].longitude, radar[j].lat, radar[j].lng, 'K');
        if (d <= max_d) {
            logJSON(LOG_LEVEL.INFO, logLevel, "radar on route", radar[j]);
            onRoute.push(radar[j]);
            break;
        }
    }
}

class DirectionsWidget extends WidgetHelper {
    createWidget(params: IWidgetParams): Promise<ListWidget> {
        let widget = new ListWidget();
        widget.setPadding(16, 16, 16, 8);
        let startColor = new Color("#F8DE5F", 1);
        let endColor = new Color("#FFCF00", 1);
        let gradient = new LinearGradient();
        gradient.colors = [startColor, endColor];
        gradient.locations = [0.0, 1];
        widget.backgroundGradient = gradient;
        let noteText = widget.addText('Radar on route: '+onRoute.length);
        noteText.font = Font.mediumRoundedSystemFont(24);
        noteText.textOpacity = 0.8;
        noteText.minimumScaleFactor = 0.25;
        return new Promise((resolve) => {
            resolve(widget);
        });;
    }
}

let dw: DirectionsWidget = new DirectionsWidget();
dw.startWidget(logLevel);