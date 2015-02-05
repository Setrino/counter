var request = require('request');
var cheerio = require('cheerio');
var jsonfile = require('jsonfile');
var async = require('async');
var file = '';
var buyBoolean = false;
var prices = '';
var increment = 1;
var iCalEvent = require('icalevent');
var fs = require('fs');
var nodemailer = require('nodemailer');
var fx = require('money');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'dragonclaw150@gmail.com',
        pass: 'Sol61afal'
    }
});

pages = {
    'DragonClaw':
    {
        siteName: 'http://steamcommunity.com/market/listings/570/Dragonclaw%20Hook',
        priceLimit: 25
    },
    'Treasure of the Emerald Dragon':
    {
        siteName: 'http://steamcommunity.com/market/listings/570/Treasure%20of%20the%20Emerald%20Dragon',
        priceLimit: 70
    },
    'Soul Diffuser':
    {
        siteName: 'http://steamcommunity.com/market/listings/570/Soul%20Diffuser',
        priceLimit: 6
    },
    'Carty':
    {
        siteName: 'http://steamcommunity.com/market/listings/570/Carty',
        priceLimit: 6
    },
    'Elder Timberbreaker': {
        siteName: 'http://steamcommunity.com/market/listings/570/Elder%20Timebreaker',
        priceLimit: 50
    },
    'Inscribed Doomling' : {
        siteName: 'http://steamcommunity.com/market/listings/570/Inscribed%20Doomling',
        priceLimit: 2
    },
    'Doomling': {
        siteName: 'http://steamcommunity.com/market/listings/570/Doomling',
        priceLimit: 2.60
    },
    'Inscribed Blade of Tears': {
        siteName: "http://steamcommunity.com/market/listings/570/Inscribed%20Blade%20of%20Tears",
        priceLimit: 4
    },
    'Unusual Nature Attendant': {
        siteName: "http://steamcommunity.com/market/listings/570/Unusual%20Stumpy%20-%20Nature%27s%20Attendant",
        priceLimit: 10
    },
    'Inscribed Pale Maosoleum': {
        siteName: "http://steamcommunity.com/market/listings/570/Inscribed%20Pale%20Mausoleum",
        priceLimit: 0.80
    },
    'Baby Roshan': {
        siteName: 'http://steamcommunity.com/market/listings/570/Baby%20Roshan',
        priceLimit: 1.60
    },
    'Unusual Osky the Otragon': {
        siteName: 'http://steamcommunity.com/market/listings/570/Unusual%20Osky%20the%20Ottragon',
        priceLimit: 15
    },
    'Unusual Trapjaw the Boxhound': {
        siteName: 'http://steamcommunity.com/market/listings/570/Unusual%20Trapjaw%20the%20Boxhound',
        priceLimit: 12
    },
    'Genuine Elixir of DragonBreath': {
        siteName: 'http://steamcommunity.com/market/listings/570/Genuine%20Elixir%20of%20Dragon%27s%20Breath',
        priceLimit: 1
    },
    'Genuine Swift Claw': {
        siteName: 'http://steamcommunity.com/market/listings/570/Genuine%20Swift%20Claw',
        priceLimit: 3.50
    },
    'Genuine Golden Severing Crest': {
        siteName: 'http://steamcommunity.com/market/listings/570/Genuine%20Golden%20Severing%20Crest',
        priceLimit: 100
    },
    'Kindred of Iron Dragon': {
        siteName: 'http://steamcommunity.com/market/listings/570/Immortal%20Reward%20-%20Kindred%20of%20the%20Iron%20Dragon',
        priceLimit: 11
    },
    'Genuine Golden Gravelman': {
        siteName: 'http://steamcommunity.com/market/listings/570/Genuine%20Golden%20Gravelmaw',
        priceLimit: 270
    },
    'Genuine Golden Empyrean': {
        siteName: 'http://steamcommunity.com/market/listings/570/Genuine%20Golden%20Empyrean',
        priceLimit: 50
    },
    'The Feeder Eater': {
        siteName: 'http://steamcommunity.com/market/listings/570/The%20Feeder-Eater',
        priceLimit: 45
    },
    'Hook of Iron Clock Knight': {
        siteName: 'http://steamcommunity.com/market/listings/570/Hook%20of%20the%20Iron%20Clock%20Knight',
        priceLimit: 60
    },
    'Corrupter Possessed Shrine of Tang Chi': {
        siteName: 'http://steamcommunity.com/market/listings/570/Corrupted%20Possessed%20Shrine%20of%20Tang-Ki',
        priceLimit: 5
    },
    'Unusual Butch': {
        siteName: 'http://steamcommunity.com/market/listings/570/Unusual%20Butch',
        priceLimit: 40
    },
    'Butch': {
        siteName: 'http://steamcommunity.com/market/listings/570/Butch',
        priceLimit: 1.70
    },
    'Unusual Babka the Bewitcher': {
        siteName: 'http://steamcommunity.com/market/listings/570/Unusual%20Babka%20the%20Bewitcher',
        priceLimit: 25
    },
    'Crystal Dryad': {
        siteName: 'https://steamcommunity.com/market/listings/570/Inscribed%20Crystal%20Dryad',
        priceLimit: 1.50
    }
};

//makeExchange(285, "RUB");

var pagesIds = Object.keys(pages);

setInterval(function(){
    async.each(pagesIds, perPage, function (err) {
        if(buyBoolean){
            sendMail(prices);
        }
        prices = '';
    });
}, 300000);

function perPage(pageID, callback) {

    var waitTime = findKeyPosition(pagesIds, pageID) * 1000;
    var timer = setTimeout(function(){

        var page = pages[pageID].siteName;
        //console.log(page);
         findEntriesNumber(page, function(price){

             var buy = '';
             var priceUSD = makeExchange(price);

             if(priceUSD < pages[pageID].priceLimit){
                 buy = '<b style="color:red">BUY</b>'
                 buyBoolean = true;
             }

             var priceString = "<div>Price for <a href=" + page + '>' + pageID + "</a> is " + price + '\t($' +
                 priceUSD + ') ' + buy +  "</div>\n";
             prices += priceString;
             console.log("Price for " + pageID + ' is ' + priceUSD);
             callback();
         });

        clearTimeout(timer);
    },waitTime);
}

findEntriesNumber = function(link, callback){
    request(link, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            $ = cheerio.load(body);
            //var resultsNo = trim(.html().replace(/\s/g, ''));
            //resultsNo = parseInt(resultsNo.substring(0, resultsNo.indexOf('res')));
            var firstRow = $("#searchResultsRows .market_listing_row .market_listing_their_price")[0];
            var lowestPrice = trim($(firstRow).find('.market_listing_price_with_fee').html());
            //console.log(trim($(firstRow).find('.market_listing_price_with_fee').html()));
            callback(lowestPrice);
        }
    });
};

var currencies = {
    'p&#1091;&#1073;'   : "RUB",
    '&#8364;'           : "EUR",
    '&#163;'            : "GBP",
    '&#36;'             : "USD",
    'MR'                : "MYR",
    'CDN&#36'           : "CAD",
    '&#82;&#36;'        : "BRL",
    'TL'                : "TRY",
    'P'                 : "CHF",
    'RM'                : "MYR"
};

function makeExchange(price){

    var currency = '';
    if(!price.match(/([0-9])/)){
        return price;
    }
    var clearPrice = (price.match(/(?!..;)[0-9]+\.?\,?[0-9]+/)).toString().replace(',', '.');
    Object.keys(currencies).forEach(function(key) {
        if(price.match(key)){
            currency = currencies[key];
        }
    });


    //console.log(currency + ' ' + clearPrice);

    fx.base = "USD";
    fx.rates = {
        "EUR" : 0.88,
        "GBP" : 0.66,
        "USD" : 2,
        "RUB" : 65.23,
        "MYR" : 3.57,
        "CAD" : 1.24,
        "BRL" : 2.69,
        "TRY" : 2.40,
        "CHF" : 0.92
    };
    // money.js is ready to use:
    return fx.convert(clearPrice, {from: currency, to: "USD"}).toFixed(2);
}

function substring(string, from, to){
    return string.substring(from, to || string.length);
}

function trim(string){
    return (string != null) ? string.trim() : null;
}

function findKeyPosition(keyArray, key){
    var i;
    for(i = 0; i < keyArray.length; i++){
        if(keyArray[i] === key){
            return i;
        }
    }
}

function writeToJSON(){

    var myJSON = eval ("(" + JSON.stringify({buildings: buildings}) + ")");

    jsonfile.writeFile('json/' + file + '.json', myJSON, function(err) {
        console.log(err);
    });
}

function sendMail(data){

    var mailOptions = {
        from: "Steam <dragonclaw150@gmail.com>",
        to: "dragonclaw150@gmail.com",
        subject: 'Test',
        text: data,
        html: data
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
}