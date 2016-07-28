# Professor Oak

Professor Oak is a Pokémon GO chat bot  
A work in progress Node.js version of [Slack-Pokemon-Notifier](https://github.com/grufftech/Slack-Pokemon-Notifier)

![screen shot](http://i.imgur.com/7BMiV1T.png)

## A note on banning
It would be wise to use a second Pokémon GO account to run this under not associated with your primary (in terms of what email address you sign up with).

## Installation
- [ ] Slack setup

0. `git clone https://github.com/benwa/Professor-Oak`
0. `nano Professor-Oak/.env`
0. Add the following environment variables
    
    | Variable            | Description                                          |
    |---------------------|------------------------------------------------------|
    | `PGO_PROVIDER`      | Pokémon GO login system. (default `google`) or `ptc` |
    | `PGO_USERNAME`      | username (default `USER`)                            |
    | `PGO_PASSWORD`      | password (default `PASS`)                            |
    | `PGO_INTERVAL`      | scan interval in milliseconds (default `10000`)      |
    | `PGO_LATITUDE`      | latitude (default `0`)                               |
    | `PGO_LONGITUDE`     | longitude (default `0`)                              |
    | `PGO_ALTITUDE`      | altitude (default `0`)                               |
    | `PGO_SLACK_TOKEN`   | Slack bot API token (default `null`)                 |
    | `PGO_SLACK_CHANNEL` | Slack channel (default `general`)                    |

0. `npm install`
0. `node index.js`

## Ignore List
Send `@professor-oak: ignore {id}` and the Professor will add it to the ignore list.
```irc
@professor-oak: ignore 16
Okay, I'll ignore Pidgey.
```

Send `@professor-oak: unignore {id}` and the Professor will remove it from the ignore list.
```irc
@professor-oak: unignore 16
Okay, I'll watch out for Pidgey.
```

Send `@professor-oak: ignore list` and the Professor will tell you the current ignore list.
```irc
@professor-oak: ignore list
I am currently ignoring Charmeleon, Wartortle, Mewtwo, Tentacruel, Aerodactyl, Omanyte, Slowpoke, Pidgeot, Arbok.
```

## Uses
* [Pokemon-GO-node-api](https://github.com/Armax/Pokemon-GO-node-api)
* [Botkit](https://howdy.ai/botkit/)
* [Redis](http://redis.io/)
