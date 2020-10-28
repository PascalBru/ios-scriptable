// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
// Licence: Robert-Koch-Institut (RKI), dl-de/by-2-0
const url_state = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%C3%A4lle_in_den_Bundesl%C3%A4ndern/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&orderByFields=LAN_ew_GEN&outSR=4326&f=json`;
const url_community = state =>
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=BL_ID%20%3D%20%27${state}%27&returnGeometry=false&outFields=*&orderByFields=GEN&outSR=4326&f=json`;

const url_community_detail = community =>
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=RS%20%3D%20%27${community}%27&returnGeometry=false&outFields=*&orderByFields=GEN&outSR=4326&f=json`;

const url_community_cases = community =>
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=IdLandkreis=\'${community}\'%20AND%20Meldedatum%20%3E%3D%20CURRENT_TIMESTAMP%20-%20INTERVAL%20%2710%27%20DAY&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&groupByFieldsForStatistics=Meldedatum&f=json&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&resultType=standard&cacheHint=true`;

const show_fields = [
    'RS',
    'GEN',
    'EWZ',
    'death_rate',
    'deaths',
    'cases',
    'cases_per_100k',
    'cases_per_population',
    'cases7_per_100k',
    'cases7_bl_per_100k',
    'recovered',
];

const round = (number, decimalPlaces) => {
    const factorOfTen = Math.pow(10, decimalPlaces);
    return Math.round(number * factorOfTen) / factorOfTen;
};

const req = new Request(url_state);
const data_state = await req.loadJSON();

const table = new UITable();
table.showSeparators = true;

data_state.features.forEach(f => {
    //console.log(f)
    console.log(
        f.attributes.LAN_ew_GEN + ' (' + f.attributes.LAN_ew_BEZ + '): ' + f.attributes.OBJECTID_1
    );
    let row = new UITableRow();
    table.addRow(row);
    let state_str = f.attributes.LAN_ew_GEN + ' (' + f.attributes.LAN_ew_BEZ + ')';
    let cell = UITableCell.text(state_str);
    cell.widthWeight = 100;
    row.addCell(cell);
    let button = UITableCell.button('🔘');
    button.widthWeight = 10;
    button.onTap = async () => {
        console.log(f.attributes.OBJECTID_1 + ' button clicked');
        loadCommunity(f.attributes.OBJECTID_1);
    };
    row.addCell(button);
});

await table.present();

async function loadCommunity(state) {
    let url_c = url_community(state);
    //console.log(url_c)
    console.log('\nload communities');

    const req_c = new Request(url_c);
    const data_community = await req_c.loadJSON();
    table.removeAllRows();
    //console.log(data_community)
    data_community.features.forEach(f => {
        //console.log(f)
        console.log(f.attributes.GEN + ' (' + f.attributes.BEZ + '): ' + f.attributes.RS);
        let row_c = new UITableRow();
        table.addRow(row_c);
        let c_str = f.attributes.GEN + ' (' + f.attributes.BEZ + ')';
        let cell = UITableCell.text(c_str);
        cell.widthWeight = 100;
        row_c.addCell(cell);
        let button = UITableCell.button('🔘');
        button.widthWeight = 10;
        button.onTap = () => {
            console.log(f.attributes.RS + ' button clicked');
            loadCommunityDetails(f.attributes.RS);
        };
        row_c.addCell(button);
    });
    table.reload();
}

async function loadCommunityDetails(community) {
    let url_cd = url_community_detail(community);
    //console.log(url_cd)
    console.log('\nload community details');

    const req_cd = new Request(url_cd);
    const data_community_d = await req_cd.loadJSON();
    table.removeAllRows();
    //console.log(JSON.stringify(data_community_d, 0, 2));
    //variables for later calculation
    let ewz = 0;
    let sevenday_incidence = 0;
    data_community_d.fields.forEach(f => {
        //console.log(f)
        if (show_fields.indexOf(f.name) != -1) {
            //console.log('show field: '+f.name + ' ' + f.alias)
            let row_c = new UITableRow();
            table.addRow(row_c);
            let c = UITableCell.text(f.alias);
            c.widthWeight = 100;
            row_c.addCell(c);
            let v = '' + data_community_d.features[0].attributes[f.name];
            console.log(f.name + ' (' + f.alias + '): ' + v);
            c = UITableCell.text(v);
            c.widthWeight = 50;
            row_c.addCell(c);
            if (f.name == 'RS') {
                let button = UITableCell.button('✂️');
                button.widthWeight = 10;
                button.dismissOnTap = true;
                button.onTap = () => {
                    console.log(v + ' copy button clicked');
                    Pasteboard.copyString(v);
                };
                row_c.addCell(button);
            } else if (f.name == 'cases7_per_100k') {
                sevenday_incidence = data_community_d.features[0].attributes[f.name];
            } else if (f.name == 'EWZ') {
                ewz = data_community_d.features[0].attributes[f.name];
            } else {
                c = UITableCell.text(' ');
                row_c.addCell(c);
                c.widthWeight = 10;
            }
        }
    });
    // add line for cases of last 10 days
    let row_c = new UITableRow();
    table.addRow(row_c);
    let c = UITableCell.text('Fallzahlen der letzten Tage');
    c.widthWeight = 100;
    row_c.addCell(c);
    c = UITableCell.text(' ');
    c.widthWeight = 50;
    row_c.addCell(c);
    let button = UITableCell.button('📊');
    button.widthWeight = 10;
    button.onTap = () => {
        console.log(community + ', ' + ewz + ', ' + sevenday_incidence + ' cases button clicked');
        loadCommunityCases(community, ewz, sevenday_incidence);
    };
    row_c.addCell(button);
    table.reload();
}

async function loadCommunityCases(community, ewz, sevenday_incidence) {
    const stage = [35, 50, 100];
    let url_cc = url_community_cases(community);
    //console.log(url_cc);
    console.log('\nload community cases');

    const req_cc = new Request(url_cc);
    const data_community_c = await req_cc.loadJSON();
    table.removeAllRows();
    //console.log(JSON.stringify(data_community_c, 0, 2));
    let incidence_date = new Date();
    incidence_date.setDate(incidence_date.getDate() - 6);
    incidence_date.setHours(0, 0, 0, 0);
    console.log(incidence_date);
    let case_summe = 0;
    data_community_c.features.forEach(f => {
        //console.log(f);
        let row_c = new UITableRow();
        table.addRow(row_c);
        let d = new Date(f.attributes.Meldedatum);
        if (d >= incidence_date) {
            case_summe += f.attributes.value;
        }
        let c = UITableCell.text(
            d.toLocaleTimeString([], {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            })
        );
        c.widthWeight = 100;
        row_c.addCell(c);
        c = UITableCell.text('' + f.attributes.value);
        c.widthWeight = 50;
        row_c.addCell(c);
    });
    let next_stage = -1;
    stage.forEach(s => {
        if (sevenday_incidence <= s) {
            next_stage = s;
            return;
        }
    });
    if (next_stage != -1) {
        let row_c = new UITableRow();
        table.addRow(row_c);
        let c = UITableCell.text('nächster Schwellwert');
        c.widthWeight = 100;
        row_c.addCell(c);
        c = UITableCell.text('' + next_stage);
        c.widthWeight = 50;
        row_c.addCell(c);
        row_c = new UITableRow();
        table.addRow(row_c);
        c = UITableCell.text('Summe');
        c.widthWeight = 100;
        row_c.addCell(c);
        c = UITableCell.text('' + case_summe);
        c.widthWeight = 50;
        row_c.addCell(c);
        let count_next_stage = round((next_stage / 100000) * ewz, 0) - case_summe;
        row_c = new UITableRow();
        table.addRow(row_c);
        c = UITableCell.text('Fälle nächster Schwellwert');
        c.widthWeight = 100;
        row_c.addCell(c);
        c = UITableCell.text('' + count_next_stage);
        c.widthWeight = 50;
        row_c.addCell(c);
    }
    table.reload();
}
