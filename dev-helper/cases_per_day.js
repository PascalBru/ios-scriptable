const https = require('https');

const url = (district_code) => 
    //`https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=IdLandkreis=\'${district_code}\' AND Meldedatum >= CURRENT_TIMESTAMP - INTERVAL '9' DAY&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&groupByFieldsForStatistics=NeuerFall,Meldedatum&f=json&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&resultType=standard&cacheHint=true`;
    `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=NeuerFall NOT IN(1, -1) AND IdLandkreis=\'${district_code}\' AND Meldedatum >= CURRENT_TIMESTAMP - INTERVAL '9' DAY&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22value%22%7D%5D&groupByFieldsForStatistics=NeuerFall,Meldedatum&f=json&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&resultType=standard&cacheHint=true`;
const url_req = url('09178');

https.get(url_req,(res) => {
    console.log("load data from "+ url_req);
    let body = "";

    res.on("data", (chunk) => {
        body += chunk;
    });

    res.on("end", () => {
        try {
            let json = JSON.parse(body);
            //console.log(JSON.stringify(json, 0, 2))
            json.features.forEach(data_day => {
                //console.log(JSON.stringify(data_day, 0, 2))
                let value = data_day.attributes.value;
                let day = new Date(data_day.attributes.Meldedatum)
                console.log(`${value} am ${day} (${data_day.attributes.NeuerFall == true ? 'neu' : 'alt'})`)
            });

        } catch (error) {
            console.error(error.message);
        };
    });

}).on("error", (error) => {
    console.error(error.message);
});