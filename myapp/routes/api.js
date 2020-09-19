require('dotenv').config();

const {Client} = require("@googlemaps/google-maps-services-js");
var express = require('express');
var router = express.Router();

const client = new Client({});

/*
    GET restaurants listing.
    usage http://localhost:3000/api/nearby?lat=51.053820&lon=3.722270&keyword=italian
*/
router.get('/nearby', async function(req, res, next) {
    client.placesNearby({
        params: {
            key: process.env.GOOGLE_KEY,
            location: [req.query.lat, req.query.lon],
            type: 'restaurant',
            minprice: 0, // minprice 0 (most affordable)
            maxprice: 4, // maxprice 4 (most expensive)
            opennow: true,
            rankby: 'distance',
            keyword: req.query.keyword
        }
    }).then((r) => {
        res.json(r.data.results);
    }).catch((e) => {
        console.log(e);
        res.send("Restaurants List Failed");
    });
});


/*
    Send picture of google to frontend
    https://stackoverflow.com/questions/29157732/how-to-send-image-to-client-using-express-node-js
 */
router.get('/photo/:ref', async function (req, res) {
    client.placePhoto({
        params: {
            key: process.env.GOOGLE_KEY,
            maxwidth: 400,
            photoreference: req.params.ref
        }
    }).then((r) => {
        res.set({'Content-Type': 'image/png'});
        res.send(r.data);
    }).catch((e) => {
        console.log(e);
        res.send("Fetching Photo Failed");
    })
});


/*
    Calculate distance from origin to destination for biking, walking and driving
    {
       "driving":{
          "distance":{
             "text":"4.2 km",
             "value":4193 // value in metric units (meter)
          },
          "duration":{
             "text":"12 mins",
             "value":692 // (seconds)
          },
          "status":"OK"
       },
       "bicycling":{ ... },
       "walking":{ ... }
    }
    http://localhost:3000/api/distance?origin_lat=51.053820&origin_lon=3.722270&dest_lat=51.0264821&dest_lon=3.715445
 */
router.get('/distance', async function (req, res) {
    let travelModes = ['driving', 'bicycling', 'walking'];
    let promises = travelModes.map(travelMode => client.distancematrix({
        params: {
            key: process.env.GOOGLE_KEY,
            origins: [[req.query.origin_lat, req.query.origin_lon]],
            destinations: [[req.query.dest_lat, req.query.dest_lon]],
            language: 'en',
            units: 'metric',
            mode: travelMode
        }
    }));

    Promise.all(promises).then(responses => {
        let result = {};
        responses.forEach((response, i) => result[travelModes[i]] = response.data.rows[0].elements[0]);
        res.json(result);
    }).catch(error => {
        console.log(error);
        res.send("Distance calculation Failed");
    });
});

module.exports = router;
