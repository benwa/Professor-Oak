'use strict';

require('dotenv').config();
var PokemonGO = require('pokemon-go-node-api');


var location = {
    type: 'coords',
    coords: {
        latitude: Number(process.env.PGO_LATITUDE || 0),
        longitude: Number(process.env.PGO_LONGITUDE || 0),
        altitude: Number(process.env.PGO_ALTITUDE || 0)
    }
};

var username = process.env.PGO_USERNAME || 'USER';
var password = process.env.PGO_PASSWORD || 'PASS';
var provider = process.env.PGO_PROVIDER || 'google';
var interval = process.env.PGO_INTERVAL || 10000;

PokemonGO.init(username, password, location, provider, function(error) {
    if (error) throw error;

    console.info('[i] Current location: %s', PokemonGO.playerInfo.locationName);
    console.info('[i] lat/long/alt: %d, %d, %d', PokemonGO.playerInfo.latitude, PokemonGO.playerInfo.longitude, PokemonGO.playerInfo.altitude);

    PokemonGO.GetProfile(function(error, profile) {
        if (error) throw error;

        console.info('[i] Username: %s', profile.username);

        // setInterval(function() {
            PokemonGO.Heartbeat(function (error, hb) {
                if (error) {
                    console.error(error);
                }
                console.log(hb);
                for (var i = hb.cells.length - 1; i >= 0; i--) {
                    if (hb.cells[i].NearbyPokemon[0]) {
                        hb.cells[i].NearbyPokemon.map(function(j) {
                            console.log(j);
                            console.log(i);
                            var pokemon = PokemonGO.pokemonlist[parseInt(j.PokedexNumber)-1];
                            console.log('[+] There is a %s at %d meters', pokemon.name, j.DistanceMeters);
                        })
                        // console.log(hb.cells[i].NearbyPokemon[0]);
                    }
                }

            });
        // }, interval);
    });
});
