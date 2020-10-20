// Licence: Robert Koch-Institut (RKI), dl-de/by-2-0
const url_lkr = (lkr_area) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=AGS=\'${lkr_area}\'&outFields=*&returnGeometry=false&outSR=4326&f=json`
// the list of AGS values
const lkr = ['09178', '09184', '09162']
const areas_widget = ['Freising', 'LK München', 'München']

const isDarkMode = Device.isUsingDarkAppearance(); // set this to true/false during debugging

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
  };
}

if (config.runsInWidget) {
  const size = config.widgetFamily;
  const widget = await createWidget(size);

  Script.setWidget(widget);
  Script.complete();
} else {
  // For debugging
  const size = 'small';
  //const size = 'medium'
  //const size = 'large'
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
  const colors = colorConfig();
  const widget = new ListWidget();
  const data = await fetchData();
  

  widget.backgroundColor = colors.bgColor;
  widget.setPadding(5, 0, 15, 0);
  const title = widget.addText(`🦠 COVID-19`);
  title.textColor = colors.textColor;
  title.centerAlignText();
  
  // small size
  if (size == 'small') {
    //title.font = Font.boldRoundedSystemFont(14);
    title.font = Font.headline()
    widget.addSpacer()
    let headline = widget.addStack();
    headline.textColor = colors.textColor;
    headline.setPadding(0, 5, 0, 5);
    headline.layoutHorizontally();
    headline.addSpacer();
    let headlineText = headline.addText('7-Tage-I');
    headlineText.textColor = colors.textColor;
    headlineText.font = Font.subheadline();
    widget.addSpacer(5)
    data.data.forEach(e => {
      console.log(e)
      let contentStack = widget.addStack();
      contentStack.setPadding(0, 5, 0, 5);
      contentStack.layoutHorizontally();
      let area = contentStack.addText(e.place);
      area.textColor = colors.textColor;
      contentStack.addSpacer();
      let seven_day = contentStack.addText(e.seven_day.toFixed(2));
      let f = e.seven_day;
      if(f >= 50.00){
        seven_day.textColor = colors.textColorRed;
      }
      else if(f >= 35.00){
        seven_day.textColor = colors.textColorOrange;
      }
      else{
        seven_day.textColor = colors.textColorGreen;
      }
    });
  }
  // medium size
  else if (size == 'medium') {
    
  } else {
    const title = widget.addText(`size not supported`);
    title.font = Font.boldRoundedSystemFont(20);
    title.textColor = colors.textColor;
    title.centerAlignText();
  }
  
  //widget.addSpacer()
  const updatedAt = new Date(data.last_update).toLocaleTimeString([], {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  let date = widget.addText(`Stand ${updatedAt}`);
  date.textColor = colors.textColor;
  date.font = Font.footnote();
  date.centerAlignText();
  return widget;
}

async function fetchData() {
  console.log("start fetch of data")
  let ret_data = { data: [], last_update: new Date(Date.now())};
  let data_bl = [];
  let df = new DateFormatter()
  df.dateFormat = 'dd.MM.yyyy, HH:mm';
  console.log(df)
  
  for (var i = 0; i<lkr.length; i++){
    let url = url_lkr(lkr[i]);
    console.log(lkr[i]+ ': '+ url);
    let req = new Request(url)
    let data_a = await req.loadJSON()
  
    //console.log(data_a.features)
    console.log(areas_widget[i] + " 7-Tage: " + data_a.features[0].attributes.cases7_per_100k + ' last update: ' + data_a.features[0].attributes.last_update)
    let updateTime = df.date(data_a.features[0].attributes.last_update.replace(' Uhr', ''));
    console.log(ret_data.last_update)
    if(updateTime.getTime() < ret_data.last_update.getTime()){
      ret_data.last_update = updateTime
    }
    ret_data.data.push({ "place" : areas_widget[i], "seven_day":  data_a.features[0].attributes.cases7_per_100k})
    if(data_bl.find(x => x.place === data_a.features[0].attributes.BL) === undefined){
      data_bl.push({ "place" : data_a.features[0].attributes.BL, "seven_day":  data_a.features[0].attributes.cases7_bl_per_100k})
    }
  }
  
  data_bl.forEach(e => ret_data.data.push(e))
  return ret_data;
 }
