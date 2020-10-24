// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
// Licence: Robert-Koch-Institut (RKI), dl-de/by-2-0
const url_state = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%C3%A4lle_in_den_Bundesl%C3%A4ndern/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&orderByFields=LAN_ew_GEN&outSR=4326&f=json`;
const url_community = state =>
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=BL_ID%20%3D%20%27${state}%27&returnGeometry=false&outFields=*&orderByFields=GEN&outSR=4326&f=json`;

const url_community_detail = community =>
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=RS%20%3D%20%27${community}%27&returnGeometry=false&outFields=*&orderByFields=GEN&outSR=4326&f=json`;

const show_fields = [
    'RS',
    'GEN',
    'death_rate',
    'deaths',
    'cases',
    'cases_per_100k',
    'cases_per_population',
    'cases7_per_100k',
    'cases7_bl_per_100k',
    'recovered',
];

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
    row.addCell(cell);
    let button = UITableCell.button('🔘');
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
        //cell.widthWeigt = 100;
        row_c.addCell(cell);
        let button = UITableCell.button('🔘');
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
    //console.log(data_community_d);
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
            } else {
                c = UITableCell.text(' ');
                row_c.addCell(c);
                c.widthWeight = 10;
            }
        }
    });
    table.reload();
}
