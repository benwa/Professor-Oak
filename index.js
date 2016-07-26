'use strict';

require('dotenv').config();
const PokemonGO = require('pokemon-go-node-api');
const moment = require('moment');


// Set up Pokémon GO API
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

// Load the 64x64 sprites
const sprites = JSON.parse(fs.readFileSync(__dirname + '/sprites.json', 'utf8'));

let seenList = [];

// Initalize the Pokémon GO API
PokemonGO.init(username, password, location, provider, function(error) {
    if (error) throw error;

    console.info(`[i] Current location: ${PokemonGO.playerInfo.locationName}`);
    console.info(`[i] lat/long/alt: ${PokemonGO.playerInfo.latitude}, ${PokemonGO.playerInfo.longitude}, ${PokemonGO.playerInfo.altitude}`);

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

                            // Add Pokémon to seen list.  This prevents duplicate notifications.
                            seenList.push(Number(k.EncounterId));

                            let pokemon = PokemonGO.pokemonlist[parseInt(k.pokemon.PokemonId)-1];

                            // Only alert for spawns greater than a minute
                            if (k.TimeTillHiddenMs > 60000) {
                                let timeLeft = moment.duration(k.TimeTillHiddenMs, 'milliseconds');
                                console.log(`[+] A wild ${pokemon.name} appeared! It will run away in ${timeLeft.minutes()} minutes!`);
                            }

                        }
                    });
                });
            });
        }, interval);
    });
});
