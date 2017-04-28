var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var fetch = require('node-fetch')
var app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'franshly') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})


function sendGenericMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Ahlan Ahlan",
                    "image_url": "https://media-cdn.tripadvisor.com/media/photo-s/07/3f/a2/83/icon.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "General Info",
                        "payload": "getGeneralInfo"

                    }, {
                        "type": "postback",
                        "title": "Check our events",
                        "payload": "getEvents",
                    },
                    {
                        "type": "postback",
                        "title": "Contact Us",
                        "payload": "getContacts",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        if (event.message && event.message.text) {

            text = event.message.text
            if (text === 'Hi') {
                sendGenericMessage(sender)
                continue
            }
            sendTextMessage(sender, "Ya Basha ana Bot, doos 3al buttons aw ektb Hi! ")
        }
        if (event.postback) {
        	// '{"payload":"getGeneralInfo"}'
            text = JSON.stringify(event.postback)
            // sendTextMessage(sender, "Postback received: "+text.substring(0, 200).payload, token)
            if(text.substring(0,200)== '{"payload":"getGeneralInfo"}'){

            fetch('http://54.187.92.64:3000/business/b/BreakOut')
			.then(res => res.json())
			.then(json => 
				{
					console.log("AHLAAAANNN");
					console.log(json);

					sendTextMessage(sender,"Description: " + json.result.description + "\n Address: " + json.result.address +
						"\n Area: " + json.result.area + "\n Fasa7ny Average Rating: " + json.result.average_rating
						,token);
				});
            continue
            }
            else if(text.substring(0,200)== '{"payload":"getEvents"}'){

            	fetch('http://54.187.92.64:3000/business/b/BreakOut')
            	.then(res => res.json())
            	.then(json => {
            		// sendTextMessage(sender, )
            	})
               sendTextMessage(sender, "Ahe el events", token)
            	continue	
            }
            else if(text.substring(0,200)== '{"payload":"getContacts"}'){
            	 fetch('http://54.187.92.64:3000/business/b/BreakOut')
			.then(res => res.json())
			.then(json => 
				{
					console.log("Contactsss");
					console.log(json);
					sendTextMessage(sender,"Email: " + json.result.email + "\n Phone numbers: " + json.result.phones,token);
				});
            continue
            }
           
        }
    }
    res.sendStatus(200)
})


var token = "EAABbNRnGzH8BALmi5nfNFdGwx8V1Oodkiu2XChFTZBr01R0YG0b77bpbgbtoI4ZAq4xPyRrK2ZCVt6aRzCSF3SffZATzDnQimZAQC1ZAWhlM56GnMELvCA8g8oMZCMpoaPIbkUzxPub7OuZAVVdsM0KMNSSBhAkLwfH3C7ggga9OTAZDZD"

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}























