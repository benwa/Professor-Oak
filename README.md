# Professor Oak

Professor Oak is a Pokémon GO chat bot  
And it's a work in progress

## A note on banning
It would be wise to use a second Pokémon GO account to run this under not associated with your primary (in terms of what email address you sign up with).

## Installation
0. `git clone https://github.com/benwa/Professor-Oak`
0. `nano Professor-Oak/.env`
0. Add the following environment variables
    
    | Variable        | Description                                             |
    |-----------------|---------------------------------------------------------|
    | `PGO_PROVIDER`  | Pokémon GO login system. (default `google`) or `ptc`    |
    | `PGO_USERNAME`  | username (default `USER`)                               |
    | `PGO_PASSWORD`  | password (default `PASS`)                               |
    | `PGO_INTERVAL`  | scan interval in milliseconds (default `10000`)         |
    | `PGO_LATITUDE`  | latitude (default `0`)                                  |
    | `PGO_LONGITUDE` | longitude (default `0`)                                 |
    | `PGO_ALTITUDE`  | altitude (default `0`)                                  |

0. `npm install`
0. `node index.js`

## Uses
* [Pokemon-GO-node-api](https://github.com/Armax/Pokemon-GO-node-api)
* [Botkit](https://github.com/howdyai/botkit)
