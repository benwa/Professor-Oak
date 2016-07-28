'use strict';

require('dotenv').config();
const Botkit = require('botkit');
const fs = require('fs');
const moment = require('moment');
const PokemonGO = require('pokemon-go-node-api');
const redisStorage = require('botkit-storage-redis')();

// Set up Botkit
const controller = Botkit.slackbot({
    'storage': redisStorage
});
const bot = controller.spawn({
    'token': process.env.PGO_SLACK_TOKEN || null
}).startRTM();
const channel = process.env.PGO_SLACK_CHANNEL || 'general';

function updateIgnoreList(id, remove) {
    if (remove) {
        ignoreList.map(function(object, index) {
            if (object === id) {
                ignoreList.splice(index, 1);
            }
        })
    } else {
        ignoreList.push(id);
    }
    ignoreList.sort();
    controller.storage.channels.save({
        'id': 'ignore',
        'list': ignoreList
    }, function(error, response) {
        if (error) console.error(error);
    });
}

// Set up bot commands
controller.hears(['^(un|)ignore (\\d+)$'], ['direct_mention'], function(bot, message) {
    let pokemonId = parseInt(message.match[2]);

    // Check if it's a valid ID
    if (PokemonGO.pokemonlist[parseInt(pokemonId)-1]) {
        let pokemonName = PokemonGO.pokemonlist[parseInt(pokemonId)-1].name;

        // Check if it is in the ignore list
        if (ignoreList.includes(pokemonId)) {
            if (message.match[1] === 'un') {
                updateIgnoreList(pokemonId, true);
                return bot.reply(message, `Okay, I'll watch out for ${pokemonName}.`);
            } else {
                return bot.reply(message, `I'm already ignoring ${pokemonName}.`);
            }
        } else {
            if (message.match[1] === 'un') {
                return bot.reply(message, `I'm already searching for ${pokemonName}.`);
            } else {
                updateIgnoreList(pokemonId)
                return bot.reply(message, `Okay, I'll ignore ${pokemonName}.`);
            }
        }
    } else {
        return bot.reply(message, 'That Pokémon ID seems to be invalid.');
    }
});
controller.hears(['^ignore list$'], ['direct_mention'], function(bot, message) {
    let pokemonNames = [];
    ignoreList.map(function(object, index) {
        pokemonNames.push(PokemonGO.pokemonlist[parseInt(object)-1].name);
    });
    bot.reply(message, `I am currently ignoring ${pokemonNames.join(', ')}.`);
});

// Set up Pokémon GO API
const provider = process.env.PGO_PROVIDER || 'google';
const username = process.env.PGO_USERNAME || 'USER';
const password = process.env.PGO_PASSWORD || 'PASS';
const interval = process.env.PGO_INTERVAL || 10000;
const location = {
    'type': 'coords',
    'coords': {
        'latitude': Number(process.env.PGO_LATITUDE || 0),
        'longitude': Number(process.env.PGO_LONGITUDE || 0),
        'altitude': Number(process.env.PGO_ALTITUDE || 0)
    }
};

// Load the 64x64 sprites
const sprites = JSON.parse(fs.readFileSync(__dirname + '/sprites.json', 'utf8'));

// Map base
const mapBase = 'https://maps.googleapis.com/maps/api/staticmap?format=png32&zoom=17&size=400x300&&style=feature:administrative|visibility:off&style=feature:landscape.man_made|element:geometry.fill|color:0x89ff82&style=feature:landscape.man_made|element:labels|visibility:off&style=feature:poi|visibility:simplified&style=feature:poi|element:labels|visibility:off&style=feature:road|element:geometry.fill|color:0x808080&style=feature:road|element:geometry.stroke|color:0xedfe91&style=feature:road|element:labels|visibility:off&style=feature:transit|visibility:off&style=feature:water|element:geometry|color:0x1a8bd9&style=feature:water|element:labels|visibility:off&style=feature:poi.park|color:0x03a286&style=feature:poi&markers=icon:';

// Initialize lists
let seenList = [];
let ignoreList = [];
controller.storage.channels.get('ignore', function(error, response){
    if (error) console.error(error);

    ignoreList = response.list;
});

// Initalize the Pokémon GO API
PokemonGO.init(username, password, location, provider, function(error) {
    if (error) throw error;

    console.info(`info: Current location: ${PokemonGO.playerInfo.locationName}`);
    console.info(`info: lat/long/alt: ${PokemonGO.playerInfo.latitude}, ${PokemonGO.playerInfo.longitude}, ${PokemonGO.playerInfo.altitude}`);

    PokemonGO.GetProfile(function(error, profile) {
        if (error) throw error;

        console.info(`info: Username: ${profile.username}`);

        setInterval(function() {
            PokemonGO.Heartbeat(function (error, hb) {
                if (error) console.error(error);

                hb.cells.map(function(j) {
                    j.WildPokemon.map(function(k) {
                        // Only alert for spawns not seen and not part of the ignore list
                        if (!seenList.some(function(element){ return element.EncounterId === Number(k.EncounterId) }) && !ignoreList.includes(k.pokemon.PokemonId)) {

                            // Add Pokémon to seen list.  This prevents duplicate notifications.
                            let timeLeft = moment.duration(k.TimeTillHiddenMs, 'milliseconds');
                            let expiration = timeLeft + moment.now();
                            seenList.push({
                                'EncounterId': Number(k.EncounterId),
                                'Expiration': expiration
                            });

                            let pokemon = PokemonGO.pokemonlist[parseInt(k.pokemon.PokemonId)-1];

                            // Only alert for spawns greater than a minute
                            if (k.TimeTillHiddenMs > 60000) {
                                console.log(`info: A wild ${pokemon.name} appeared! It will run away in ${timeLeft.humanize()}!`);

                                // Build map
                                let map = `${mapBase}${sprites[k.pokemon.PokemonId]}|${k.Latitude},${k.Longitude}`;

                                // Build directions
                                let directions = `https://maps.google.com/maps/dir/${location.coords.latitude},${location.coords.longitude}/${k.Latitude},${k.longitude}/data=!3m1!4b1!4m2!4m1!3e2`;

                                // Send notification
                                bot.say({
                                    'username': 'Professor Oak',
                                    'icon_url': 'http://i.imgur.com/zkuUCrq.png',
                                    'channel': channel,
                                    'text': `A wild ${pokemon.name} appeared! It will run away in ${timeLeft.humanize()}!`,
                                    'attachments': [{
                                        'fallback': `${k.Latitude}, ${k.Longitude}`,
                                        'title': 'Directions',
                                        'title_link': directions,
                                        'image_url': map
                                    }]
                                });
                            }

                        }

                        // Clean up the seen list
                        seenList.map(function(object, index) {
                            if (moment().isAfter(object.Expiration)) {
                                seenList.splice(index, 1);
                            }
                        });
                    });
                });
            });
        }, interval);
    });
});
