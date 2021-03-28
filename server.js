/* 
 * This code is provided solely for the personal and private use of students 
 * taking the CSC309H course at the University of Toronto. Copying for purposes 
 * other than this use is expressly prohibited. All forms of distribution of 
 * this code, including but not limited to public repositories on GitHub, 
 * GitLab, Bitbucket, or any other online platform, whether as given or with 
 * any changes, are expressly prohibited. 
*/  

/* E4 server.js */
'use strict';
const log = console.log;

// Express
const express = require('express')
const app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.json());

// Mongo and Mongoose
const { ObjectID, ReplSet } = require('mongodb')
const { mongoose } = require('./db/mongoose');
const { Restaurant } = require('./models/restaurant')

/* 
   Restaurant API routes below. 
   Note: You may use async-await if you wish, but you will have to modify the functions as needed.
*/

/// Route for adding restaurant, with *no* reservations (an empty array).
/* 
Request body expects:
{
	"name": <restaurant name>
	"description": <restaurant description>
}
Returned JSON should be the database document added.
*/
// POST /restaurants
app.post('/restaurants', (req, res) => {
	// Add code here
	const data = {};
	data["name"] = req.body.name;
	data["reservations"] = [];
	data["description"] = req.body.description;

	const restObject = new Restaurant(data);
	restObject.save((err, result) => {
		if(err) return res.status(500).send(err);
		return res.status(200).json(result);
	});
})


/// Route for getting all restaurant information.
// GET /restaurants
app.get('/restaurants', (req, res) => {
	// Add code here
	Restaurant.find((err, results) => {
		if(err) return res.status(500).send(err);
		return res.status(200).json(results);
	});
})


/// Route for getting information for one restaurant.
// GET /restaurants/id
app.get('/restaurants/:id', (req, res) => {
	// Add code here
	const query = {};
	query._id = req.params.id;
	Restaurant.findOne(query, (err, result) => {
		if(err) return res.status(500).send(err);
		return res.status(200).json(result);
	});
})


/// Route for adding reservation to a particular restaurant.
/* 
Request body expects:
{
	"time": <time>
	"people": <number of people>
}
*/
// Returned JSON should have the updated restaurant database 
//   document that the reservation was added to, AND the reservation subdocument:
//   { "reservation": <reservation subdocument>, "restaurant": <entire restaurant document>}
// POST /restaurants/id
app.post('/restaurants/:id', (req, res) => {
	// Add code here
	const reservation = {};
	reservation["time"] = req.body.time;
	reservation["people"] = req.body.people;

	const newId = req.params.id;
	const data = {_id : newId};

	Restaurant.findOne(query, (err, result) => {
		if(err) return res.status(500).send(err);
		result.reservations.push(reservation);
		result.save((error, doc) => {
			if(error) res.status(500).send(err);
			else res.status(200).json({
				"restaurant": doc,
				"reservation": doc.reservations
			});
		});
	});
})


/// Route for getting information for one reservation of a restaurant (subdocument)
// GET /restaurants/id
app.get('/restaurants/:id/:resv_id', (req, res) => {
	// Add code here
	const query = {};
	const reservationId = req.params.resv_id;
	query._id = req.params.id;

	Restaurant.findOne(query, (err, result) => {
		if(err) return res.status(500).send(err);
		const obj = result.reservations.id(reservationId);
		return res.status(200).json(obj);
	});
})


/// Route for deleting reservation
// Returned JSON should have the updated restaurant database
//   document from which the reservation was deleted, AND the reservation subdocument deleted:
//   { "reservation": <reservation subdocument>, "restaurant": <entire restaurant document>}
// DELETE restaurant/<restaurant_id>/<reservation_id>
app.delete('/restaurants/:id/:resv_id', (req, res) => {
	// Add code here
	const query = {};
	query._id = req.params.id;
	const reservationId = req.params.resv_id;

	Restaurant.findOne(query, (err, result) => {
		if(err) return res.status(500).send(err);
		const discard = result.reservations.id(reservationId);
		result.reservations.remove(reservationId);
		result.save((error) => {
			if(error) return res.status(500).send(error);
			res.status(200).json({
				"reservation": discard,
				"restaurant": result
			});
		});
	});
})


/// Route for changing reservation information
/* 
Request body expects:
{
	"time": <time>
	"people": <number of people>
}
*/
// Returned JSON should have the updated restaurant database
//   document in which the reservation was changed, AND the reservation subdocument changed:
//   { "reservation": <reservation subdocument>, "restaurant": <entire restaurant document>}
// PATCH restaurant/<restaurant_id>/<reservation_id>
app.patch('/restaurants/:id/:resv_id', (req, res) => {
	// Add code here
	const query = {};
	query._id = req.params.id;
	const reservationId = req.params.resv_id;

	Restaurant.findOne(query, (err, rest) => {
		if(err) return res.status(500).send(err);
		var chosen = rest.reservations.id(reservationId);
		chosen.people = req.body.people;
		chosen.time = req.body.time;

		rest.save((error, result) => {
			if(error) return res.status(500).send(error);
			return res.status(200).json({
				"reservation": chosen,
				"restaurant": result
			});
		});
	});
})


////////// DO NOT CHANGE THE CODE OR PORT NUMBER BELOW
const port = process.env.PORT || 5000
app.listen(port, () => {
	log(`Listening on port ${port}...`)
});
