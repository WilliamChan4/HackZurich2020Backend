require('dotenv').config();

const {Client} = require("@googlemaps/google-maps-services-js");
var express = require('express');
var router = express.Router();

const client = new Client({});

/* GET restaurants listing. */
router.get('/nearby', async function(req, res, next) {
    client.placesNearby({
        params: {
            key: process.env.GOOGLE_KEY,
            location: [51.053820, 3.722270],
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

module.exports = router;
