// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
// Licence: Robert-Koch-Institut (RKI), dl-de/by-2-0
const url_state = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%C3%A4lle_in_den_Bundesl%C3%A4ndern/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&orderByFields=LAN_ew_GEN&outSR=4326&f=json`;
const url_community = (state) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=BL_ID%20%3D%20%27${state}%27&returnGeometry=false&outFields=*&orderByFields=GEN&outSR=4326&f=json`;

const req = new Request(url_state);
const data_state = await req.loadJSON();

const table = new UITable();
table.showSeparators = true;
    
data_state.features.forEach(f => {
  //console.log(f)
  console.log(f.attributes.LAN_ew_GEN+' ('+f.attributes.LAN_ew_BEZ+'): '+f.attributes.OBJECTID_1)
  let row = new UITableRow()
  table.addRow(row)
  let state_str = f.attributes.LAN_ew_GEN+' ('+f.attributes.LAN_ew_BEZ+')'
  let cell = UITableCell.text(state_str);
  row.addCell(cell)
  let button = UITableCell.button('✅')
  button.onTap = async() => {
    console.log(f.attributes.OBJECTID_1 +' button clicked');
    loadCommunity(f.attributes.OBJECTID_1);
  }
  row.addCell(button)
})

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
    console.log(f.attributes.GEN+' ('+f.attributes.BEZ+'): '+f.attributes.RS)
    let row_c = new UITableRow()
    table.addRow(row_c)
    let c_str = f.attributes.GEN+' ('+f.attributes.BEZ+')'
    let cell = UITableCell.text(c_str);
    //cell.widthWeigt = 100;
    row_c.addCell(cell)
    let button = UITableCell.button('✅')
    //button.widthWeight = 10;
    button.dismissOnTap = true;
    button.onTap = () => {
      console.log(f.attributes.RS +' button clicked');
      Pasteboard.copy(f.attributes.RS);
    }
    row_c.addCell(button)
  })
  table.reload();
}
