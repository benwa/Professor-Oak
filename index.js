'use strict';

require('dotenv').config();
const PokemonGO = require('pokemon-go-node-api');
const moment = require('moment');


const provider = process.env.PGO_PROVIDER || 'google';
const username = process.env.PGO_USERNAME || 'USER';
const password = process.env.PGO_PASSWORD || 'PASS';
const interval = process.env.PGO_INTERVAL || 10000;
const location = {
    type: 'coords',
    coords: {
        latitude: Number(process.env.PGO_LATITUDE || 0),
        longitude: Number(process.env.PGO_LONGITUDE || 0),
        altitude: Number(process.env.PGO_ALTITUDE || 0)
    }
};


let seenList = [];

PokemonGO.init(username, password, location, provider, function(error) {
    if (error) throw error;

    console.info('[i] Current location: %s', PokemonGO.playerInfo.locationName);
    console.info('[i] lat/long/alt: %d, %d, %d', PokemonGO.playerInfo.latitude, PokemonGO.playerInfo.longitude, PokemonGO.playerInfo.altitude);

    PokemonGO.GetProfile(function(error, profile) {
        if (error) throw error;

        console.info('[i] Username: %s', profile.username);

        setInterval(function() {
            PokemonGO.Heartbeat(function (error, hb) {
                if (error) console.error(error);

                hb.cells.map(function(j) {
                    j.WildPokemon.map(function(k) {
                        // Only alert for spawns not seen yet
                        if (!seenList.includes(Number(k.EncounterId))) {
                            seenList.push(Number(k.EncounterId));
                            let pokemon = PokemonGO.pokemonlist[parseInt(k.pokemon.PokemonId)-1];

                            // Only alert for spawns greater than a minute
                            if (k.TimeTillHiddenMs > 60000) {
                                let timeLeft = moment.duration(k.TimeTillHiddenMs, 'milliseconds');
                                console.log('[+] A wild %s appeared! It will despawn in %d minutes!', pokemon.name, timeLeft.minutes());
                            }

                        }
                    });
                });
            });
        }, interval);
    });
});
