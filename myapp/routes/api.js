require('dotenv').config();

const {Client} = require("@googlemaps/google-maps-services-js");
var express = require('express');
var router = express.Router();

const client = new Client({});

/*
    GET restaurants listing.
    usage http://localhost:3000/api/nearby?lat=51.053820&lon=3.722270
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
        }
    }).then((r) => {
        console.log(r);
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

module.exports = router;
