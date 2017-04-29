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


function sendHagatMessage(sender) {
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
                        "title": "Check Our Facilities",
                        "payload": "getFacilities"

                    }, 
                    {
                        "type": "postback",
                        "title": "Check Our Events",
                        "payload": "getEvents"
                    },
                   
                    {
                        "type": "postback",
                        "title": "Check Our Offers",
                        "payload": "getOffers"
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

                    }, 
                    {
                        "type": "postback",
                        "title": "Check Our Hagat",
                        "payload": "getHagat"
                    },
                   
                    {
                        "type": "postback",
                        "title": "Contact Us",
                        "payload": "getContacts"
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
					// console.log("AHLAAAANNN");
					// console.log(json);

					sendTextMessage(sender,"Description: " + json.result.description + "\n Address: " + json.result.address +
						"\n Area: " + json.result.area + "\n Fasa7ny Average Rating: " + json.result.average_rating
						,token);
				});
            continue
            }
            else if(text.substring(0,200)== '{"payload":"getHagat"}'){

            	sendHagatMessage(sender)
            	continue	
            }
             else if(text.substring(0,200)== '{"payload":"getEvents"}'){

            	fetch('http://54.187.92.64:3000/business/b/BreakOut')
            	.then(res => res.json())
            	.then(json => {
            		// console.log("Events")
            		if((json.events && json.events.length == 0) || (!json.events)) {
            			sendTextMessage(sender, "No Events",token);
            		} else {
            			getOnceEvents(sender, json.events);
            		}
            	});
               
            	continue	
            }

             else if(text.substring(0,200)== '{"payload":"getFacilities"}'){

            	fetch('http://54.187.92.64:3000/business/b/BreakOut')
            	.then(res => res.json())
            	.then(json => {
            		// console.log("Facilities");
            		// console.log(json.facilities);
            		if((json.facilities && json.facilities.length == 0) || (!json.facilities)) {
            			sendTextMessage(sender, "No Facilities",token);
            		} else {
            			getFacilities(sender, json.facilities);
            		}
            	});   
            	continue	
            }

             else if(text.substring(0,200)== '{"payload":"getOffers"}'){
            
				sendTextMessage(sender,"Offers",token);
			
            continue
            }

            else if(text.substring(0,200)== '{"payload":"getContacts"}'){
            	fetch('http://54.187.92.64:3000/business/b/BreakOut')
				.then(res => res.json())
				.then(json => 
				{
					// console.log("Contactsss");
					// console.log(json);
					sendTextMessage(sender,"Email: " + json.result.email,token);
					getPhones(sender,json.result.phones);
				});
            continue
            } 
            else if(text.substring(0,19) == '{"payload":"Event: ') {
        		eventId = text.substring(19, text.length - 2);

        		fetch('http://54.187.92.64:3000/event/getOnceEventDetails/' + eventId)
				.then(res => res.json()) //don't forget to handle errors(d.error))
				.then(json => 
				{ //({business: event.business_id, event:event, eventocc:eventocc});
					// console.log("getonceeventdetaiillsssss");
					// console.log(json);
					// 2017-04-30T22:00:00.000Z
					var date = new Date(json.eventocc.day);
					var day = date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
					sendTextMessage(sender,"Name: " + json.event.name + "\nDescription: " + json.event.description +
					 "\nDay: "+ day + "\nTiming: " + json.eventocc.time + "\nPrice: " + json.event.price + 
					 "\nCapacity: " + json.event.capacity + "\nAvailable: "+json.eventocc.available, token);
				});
        		// console.log(id);
        		// sendTextMessage(sender, "EVENTID " + eventId,token);

            } else if(text.substring(0,22) == '{"payload":"Facility: ') {
            	facilityId = text.substring(22, text.length - 2);
            	fetch('http://54.187.92.64:3000/event/getEvents/' + facilityId)
            	.then(res => res.json())
            	.then(json => 
            	{//res.status(200).json({events:events, eventocc:eventocc,name:facility.name});
            		getDailyEvents(sender, json.events, json.eventocc, json.name);
            	});
            } else if(text.substring(0,17) == '{"payload":"occ: ') {
            	eventId = text.substring(17,text.length - 2);
            	fetch('http://54.187.92.64:3000/event/viewO/' + eventId) //{eventocc:events}
            	.then(res => res.json())
            	.then(json => {
            		var s = "";
            		for(var i = 0; i < json.eventocc.length; i++) {
            			var date = new Date(json.eventocc[i].day);
            			var day = date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
            			sendTextMessage(sender, s, token);
            			var tmp = day + "\nAvailable Places: " + json.eventocc[i].available + "\n\n";
            			// console.log(tmp)
            			s = s + tmp;
            		}
            		console.log("SS",s);
            		// sendTextMessage(sender, s, token);
            	})
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


function getFacilities(sender, facilities) {
	console.log("ANA FL FACILITY");
	var cards = Math.ceil(facilities.length / 3);
	console.log(cards);
	var elem = [];
	for(var i = 0; i < facilities.length; i+=3) {
		var buttons = [];

		var facility1 = facilities[i];
		buttons.push({
			"type":"postback",
			"title":facility1.name,
			payload: "Facility: "+ facility1._id
		})
		if(facilities[i+1]){ 
			var facility2 = facilities[i+1];
			buttons.push({
				"type":"postback",
				"title":facility2.name,
				payload: "Facility: "+ facility2._id
			})
		}
		if(facilities[i+2]){
			var facility3 = facilities[i+2];
			buttons.push({
				"type":"postback",
				"title":facility3.name,
				payload: "Facility: "+ facility3._id
			})
		} 

		console.log("BUTTONS", buttons);

		elem.push({
			"title": "Facilities",
			"image_url": "https://media-cdn.tripadvisor.com/media/photo-s/07/3f/a2/83/icon.jpg",
			"buttons" : buttons
		})

		console.log("ELEMS", elem);
	}

	messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elem
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


function getOnceEvents(sender, events) {
	console.log("ANA FL FACILITY");
	var cards = Math.ceil(events.length / 3);
	console.log(cards);
	var elem = [];
	for(var i = 0; i < events.length; i+=3) {
		var buttons = [];

		var event1 = events[i];
		buttons.push({
			"type":"postback",
			"title":event1.name,
			payload: "Event: "+ event1._id
		})
		if(events[i+1]){ 
			var event2 = events[i+1];
			buttons.push({
				"type":"postback",
				"title":event2.name,
				payload: "Event: "+ event2._id
			})
		}
		if(events[i+2]){
			var event3 = events[i+2];
			buttons.push({
				"type":"postback",
				"title":event3.name,
				payload: "Event: "+ event3._id
			})
		} 

		console.log("BUTTONS", buttons);

		elem.push({
			"title": "Events",
			"image_url": "https://media-cdn.tripadvisor.com/media/photo-s/07/3f/a2/83/icon.jpg",
			"buttons" : buttons
		})

		console.log("ELEMS", elem);
	}

	messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elem
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

//getDailyEvents(sender, json.events, json.eventocc, json.name);

function getDailyEvents(sender, events, eventoccs, name) {
	// console.log("GET DAILY EVENTS");
	for(var i = 0; i < events.length; i++)
		for(var j = 0; j < eventoccs.length; j++)
			if(events[i]._id == eventoccs[j].event) {
				events[i].time = eventoccs[j].time;
				break;
			}

	for(var x = 0; x < events.length; x++) {
      	var days = "";
      	// console.log("daysoff: " + events[x]);
      	for(var y = 0; events[x].daysOff && y < events[x].daysOff.length ; y++){
        	if(events[x].daysOff[y]==0){ days = days + "Sunday, ";}
        	else if(events[x].daysOff[y]==1){ days = days + "Monday, ";}
        	else if(events[x].daysOff[y]==2){ days = days + "Tuesday, ";}
        	else if(events[x].daysOff[y]==3){ days = days + "Wednesday, ";}
        	else if(events[x].daysOff[y]==4){ days = days + "Thursday, ";}
        	else if(events[x].daysOff[y]==5){ days = days + "Friday, ";}
        	else if(events[x].daysOff[y]==6){ days = days + "Saturday, ";}
      	}
		if(events[x].daysOff.length == 0){
			days = "No days off";
			events[x].days = days
		}
		else{
    		events[x].days = days.substring(0, days.length-2);
		}
    }
    // console.log(JSON.stringify(events));
    var cards = events.length;
    var elem = [];
    for(var l = 0; l < events.length; l++) {
    	elem.push({
			"title": events[l].time,
			"subtitle": "Price: " + events[l].price + "\n DaysOff: " + events[l].days,
			"image_url": "https://media-cdn.tripadvisor.com/media/photo-s/07/3f/a2/83/icon.jpg",
			"buttons" : [{
                        "type": "web_url",
                        "url": "https://54.187.92.64:8000/#!/viewOccurences/"+events[l]._id,
                        "title": "View Occurrences"
                    }]
		})
    }
    messageData = {
        "attachment": {
        	"type": "template",
        	"payload": {
       	    	"template_type": "generic",
            	"elements": elem
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


function getPhones(sender, phones) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Phone Numbers",
                    "image_url": "https://media-cdn.tripadvisor.com/media/photo-s/07/3f/a2/83/icon.jpg",
                    "buttons": [
                    			{
          						"type":"phone_number",
          						"title":"Call"+phones[0],
          						"payload":phones[0]
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






















