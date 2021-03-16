export interface GPSPoint {
    latitude: number;
    longitude: number
}

export interface DirectionPolyline {
    name: string;
    polyline: string;
    max_distance: number;
}

export interface Direction {
    start: GPSPoint;
    end: GPSPoint;
    directions: DirectionPolyline[];
}

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                               :::
//:::  This routine decodes an encoded polyline to the list of points               :::
//:::  (latitude/longitude).                                                        :::
//:::  https://developers.google.com/maps/documentation/utilities/polylinealgorithm :::
//:::                                                                               :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function decodePolyline(encoded: string): GPSPoint[] {
    if (!encoded) {
        return [];
    }
    var poly: GPSPoint[] = [];
    var index = 0, len = encoded.length;
    var lat = 0, lng = 0;

    while (index < len) {
        var b, shift = 0, result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result = result | ((b & 0x1f) << shift);
            shift += 5;
        } while (b >= 0x20);

        var dlat = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
        lat += dlat;

        shift = 0;
        result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result = result | ((b & 0x1f) << shift);
            shift += 5;
        } while (b >= 0x20);

        var dlng = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
        lng += dlng;

        var p = {
            latitude: lat / 1e5,
            longitude: lng / 1e5,
        };
        poly.push(p);
    }
    return poly;
}

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                               :::
//:::  This routine encodes a list of points (latitude/longitude) to polyline.      :::
//:::  https://developers.google.com/maps/documentation/utilities/polylinealgorithm :::
//:::                                                                               :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function encodePolyline(points: GPSPoint[]): string {
	var i = 0;
 
	var plat = 0;
	var plng = 0;
 
	var encoded_points = "";
 
	for(i = 0; i < points.length; ++i) {
	    var lat = points[i].latitude;				
		var lng = points[i].longitude;		
 
		encoded_points += encodePoint(plat, plng, lat, lng);
 
	    plat = lat;
	    plng = lng;
	}
 
	return encoded_points;
}
 
function encodePoint(plat, plng, lat, lng) {
	var dlng = 0;
	var dlat = 0;
 
	var late5 = Math.round(lat * 1e5);
	var plate5 = Math.round(plat * 1e5)    
 
	var lnge5 = Math.round(lng * 1e5);
	var plnge5 = Math.round(plng * 1e5)
 
	dlng = lnge5 - plnge5;
	dlat = late5 - plate5;
 
	return encodeSignedNumber(dlat) + encodeSignedNumber(dlng);
}
 
function encodeSignedNumber(num) {
	var sgn_num = num << 1;
 
	if (num < 0) {
		sgn_num = ~(sgn_num);
	}
 
	return(encodeNumber(sgn_num));
}
 
function encodeNumber(num) {
	var encodeString = "";
 
	while (num >= 0x20) {
		encodeString += (String.fromCharCode((0x20 | (num & 0x1f)) + 63));
		num >>= 5;
	}
 
	encodeString += (String.fromCharCode(num + 63));
	return encodeString;
}

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lng1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lng2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function distance(lat1: number, lng1: number, lat2: number, lng2: number, unit: string) {
    if ((lat1 == lat2) && (lng1 == lng2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lng1 - lng2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") { dist = dist * 1.609344 }
        if (unit == "N") { dist = dist * 0.8684 }
        return dist;
    }
}

function calcCenter(lat1: string, lng1: string, lat2: string, lng2: string): GPSPoint | undefined {
    let pos_c_lat = Math.min(parseFloat(lat1), parseFloat(lat2)) + (Math.abs(parseFloat(lat1) - parseFloat(lat2)) / 2)
    let pos_c_lng = Math.min(parseFloat(lng1), parseFloat(lng2)) + (Math.abs(parseFloat(lng1) - parseFloat(lng2)) / 2)
    return {latitude: pos_c_lat, longitude: pos_c_lng};
}

export { decodePolyline, encodePolyline, distance, calcCenter };