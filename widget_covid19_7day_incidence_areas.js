// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: database;
// Licence: Robert Koch-Institut (RKI), dl-de/by-2-0
// the list of RS values
const district_code = ['09178', '09184', '09162'];
// the names shown in the widget
const district_widget = ['Freising', 'LK München', 'München'];
// url for the data of an district
const url_district = district_code =>
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=RS=\'${district_code}\'&outFields=*&returnGeometry=false&outSR=4326&f=json`;
// url for the data of the new cases per district
const url_district_new_case = district_code =>
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=(NeuerFall%20IN(1%2C%20-1))%20AND%20(IdLandkreis=\'${district_code}\')&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&resultType=standard&cacheHint=true`;
// url for the data of the count of case during last 7 days without yesterday per district
const url_district_7day_old = district_code =>
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall%20NOT%20IN(1%2C%20-1)%20AND%20IdLandkreis=\'${district_code}\'%20AND%20Meldedatum%20%3E%3D%20CURRENT_TIMESTAMP%20-%20INTERVAL%20%279%27%20DAY&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&f=json&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&resultType=standard&cacheHint=true`;
// url for the data of the new cases per state
const url_state_new_case = state_code =>
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=(NeuerFall%20IN(1%2C%20-1))%20AND%20(IdBundesland=\'${state_code}\')&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&resultType=standard&cacheHint=true`;
// url for the data of the count of case during last 7 days without yesterday per state
const url_state_7day_old = state_code =>
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall%20NOT%20IN(1%2C%20-1)%20AND%20IdBundesland=${state_code}%20AND%20Meldedatum%20%3E%3D%20CURRENT_TIMESTAMP%20-%20INTERVAL%20%279%27%20DAY&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&f=json&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&resultType=standard&cacheHint=true`;
// url for the data of the new cases per state
const url_state = state_code =>
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%C3%A4lle_in_den_Bundesl%C3%A4ndern/FeatureServer/0/query?where=OBJECTID_1=${state_code}&outFields=*&returnGeometry=false&outSR=4326&f=json`;

// set this to true/false during debugging
const isDarkMode = Device.isUsingDarkAppearance();

function colorConfig() {
    const [bgColor, textColor] = isDarkMode
        ? // dark mode
          [new Color('#1A1B1E', 1), new Color('#E3E3E3')]
        : // light mode
          [new Color('#ffffff', 1), new Color('#000000')];

    return {
        bgColor: bgColor,
        textColor: textColor,
        textColorGreen: Color.green(),
        textColorOrange: Color.orange(),
        textColorRed: Color.red(),
        textColorDarkRed: new Color('#900E0E', 1),
    };
}

const round = (number, decimalPlaces) => {
    const factorOfTen = Math.pow(10, decimalPlaces);
    return Math.round(number * factorOfTen) / factorOfTen;
};

if (config.runsInWidget) {
    const size = config.widgetFamily;
    const widget = await createWidget(size);

    // update widget only every hour, because data are only updated once a day from RKI
    let refreshDate = new Date();
    refreshDate.setHours(refreshDate.getHours() + 1);
    widget.refreshAfterDate = refreshDate;

    Script.setWidget(widget);
    Script.complete();
} else {
    // For debugging
    const alert = new Alert();
    alert.title = 'Widget-Site';
    alert.message = 'Choose size of widget!';
    alert.addAction('small');
    alert.addAction('medium');
    alert.addAction('large');
    let alertR = await alert.present();
    const size = alertR == 0 ? 'small' : alertR == 1 ? 'medium' : 'large';
    const widget = await createWidget(size);
    if (size == 'small') {
        widget.presentSmall();
    } else if (size == 'medium') {
        widget.presentMedium();
    } else {
        widget.presentLarge();
    }
    Script.complete();
}

async function createWidget(size) {
    console.log('create widget with size: ' + size);
    const colors = colorConfig();
    const widget = new ListWidget();
    const data = await fetchData();

    widget.backgroundColor = colors.bgColor;
    widget.setPadding(10, 0, 10, 0);
    const title = widget.addText(`🦠 COVID-19`);
    title.textColor = colors.textColor;
    title.centerAlignText();

    // small and medium size
    if (((size == 'small' || size == 'medium') && data.data.length <= 4) || size == 'large') {
        //title.font = Font.boldRoundedSystemFont(14);
        title.font = Font.headline();
        widget.addSpacer();
        let headline = widget.addStack();
        headline.textColor = colors.textColor;
        headline.setPadding(0, 5, 0, 5);
        headline.addSpacer();
        //create second stack in headline
        headline = headline.addStack();
        let headlineText = headline.addText('7-Tage-I');
        headlineText.textColor = colors.textColor;
        headlineText.font = Font.subheadline();
        if (size == 'medium' || size == 'large') {
            headline.addSpacer(15);
            let headlineText = headline.addText('Vortag');
            headlineText.textColor = colors.textColor;
            headlineText.font = Font.subheadline();
        } else {
        }
        data.data.forEach(e => {
            //console.log(e);
            let contentStack = widget.addStack();
            contentStack.setPadding(0, 5, 0, 5);
            let area = contentStack.addText(e.place);
            area.textColor = colors.textColor;
            contentStack.addSpacer();
            //create second stack in contentStack
            contentStack = contentStack.addStack();
            let trend;
            if (e.seven_day_100k_before != undefined) {
                trend =
                    e.seven_day_100k == e.seven_day_100k_before
                        ? '   '
                        : e.seven_day_100k < e.seven_day_100k_before
                        ? '↓'
                        : '↑';
            } else {
                trend = '   ';
            }
            let seven_day = contentStack.addText(e.seven_day_100k.toFixed(2) + trend);
            let f = e.seven_day_100k;
            if (f >= 100.0) {
                seven_day.textColor = colors.textColorDarkRed;
            } else if (f >= 50.0) {
                seven_day.textColor = colors.textColorRed;
            } else if (f >= 35.0) {
                seven_day.textColor = colors.textColorOrange;
            } else {
                seven_day.textColor = colors.textColorGreen;
            }
            if (size == 'medium' || size == 'large') {
                contentStack.size = new Size(120, 0);
                contentStack.addSpacer();
                let ncw;
                if (e.new_cases != undefined) {
                    ncw = contentStack.addText(e.new_cases.toFixed(0));
                } else {
                    ncw = contentStack.addText('  ');
                }
                ncw.rightAlignText();
            }
        });
        widget.addSpacer();
    } else {
        const title = widget.addText(`size/amount not supported`);
        title.font = Font.boldRoundedSystemFont(20);
        title.textColor = colors.textColor;
        title.centerAlignText();
    }

    // time stamp for last update
    const updatedAt = new Date(data.last_update).toLocaleTimeString([], {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
    let date = widget.addText(`Stand ${updatedAt}`);
    date.textColor = colors.textColor;
    date.font = Font.footnote();
    date.centerAlignText();
    return widget;
}

async function fetchData() {
    console.log('start fetch of data');
    let ret_data = { data: [], last_update: new Date(Date.now()) };
    let data_bl = [];
    let df = new DateFormatter();
    df.dateFormat = 'dd.MM.yyyy, HH:mm';

    for (var i = 0; i < district_code.length; i++) {
        let url = url_district(district_code[i]);
        //console.log(district_code[i] + ': ' + url);
        let req = new Request(url);
        let data_a = await req.loadJSON();
        //console.log(data_a.features)

        url = url_district_new_case(district_code[i]);
        //console.log(district_code[i] + ': ' + url);
        req = new Request(url);
        let data_b = await req.loadJSON();

        url = url_district_7day_old(district_code[i]);
        //console.log(district_code[i] + ': ' + url);
        req = new Request(url);
        let data_c = await req.loadJSON();
        //console.log(data_c)

        // set time of last update
        let updateTime = df.date(data_a.features[0].attributes.last_update.replace(' Uhr', ''));
        if (updateTime.getTime() < ret_data.last_update.getTime()) {
            ret_data.last_update = updateTime;
        }
        const new_cases = data_b.features[0].attributes.value;
        const new_cases_100k =
            (data_b.features[0].attributes.value / data_a.features[0].attributes.EWZ) * 100000;
        const seven_day_100k_before =
            (data_c.features[0].attributes.value / data_a.features[0].attributes.EWZ) * 100000;
        const data_district = {
            place: district_widget[i],
            seven_day_100k: round(data_a.features[0].attributes.cases7_per_100k, 4),
            seven_day_100k_before: round(seven_day_100k_before, 4),
            new_cases: new_cases,
            new_cases_100k: round(new_cases_100k, 4),
        };
        console.log(JSON.stringify(data_district, 0, 2));
        ret_data.data.push(data_district);
        if (data_bl.find(x => x.place === data_a.features[0].attributes.BL) === undefined) {
            // load date for state
            url = url_state_new_case(data_a.features[0].attributes.BL_ID);
            req = new Request(url);
            let data_s_a = await req.loadJSON();
            url = url_state(data_a.features[0].attributes.BL_ID);
            req = new Request(url);
            let data_s_b = await req.loadJSON();
            url = url_state_7day_old(data_a.features[0].attributes.BL_ID);
            req = new Request(url);
            let data_s_c = await req.loadJSON();
            const new_cases_100k =
                (data_s_a.features[0].attributes.value /
                    data_s_b.features[0].attributes.LAN_ew_EWZ) *
                100000;
            const seven_day_100k_before =
                (data_s_c.features[0].attributes.value /
                    data_s_b.features[0].attributes.LAN_ew_EWZ) *
                100000;
            const data_state = {
                place: data_a.features[0].attributes.BL,
                seven_day_100k: round(data_a.features[0].attributes.cases7_bl_per_100k, 4),
                seven_day_100k_before: round(seven_day_100k_before, 4),
                new_cases: data_s_a.features[0].attributes.value,
                new_cases_100k: round(new_cases_100k, 4),
            };
            console.log(JSON.stringify(data_state, 0, 2));
            data_bl.push(data_state);
        }
    }

    data_bl.forEach(e => ret_data.data.push(e));
    return ret_data;
}
