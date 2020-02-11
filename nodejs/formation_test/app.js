
require("babel-register");

const {success, error, checkAndChange} = require('./assets/functions');

const mysql = require("promise-mysql");

const express = require("express");
/*const expressOasGenerator = require('express-oas-generator'); */

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./assets/swagger.json');


const morgan = require("morgan")('dev');

const bodyParser = require("body-parser");

const config = require("./assets/config");

/*app.use((req, res, next) => {
	console.log('URL : ' + req.url);
	next();
})*/


mysql.createConnection({
	host: config.db.host,
	database : config.db.database,
	user: config.db.user, 
	password: config.db.password
}).then((db) => {
	
	console.log("connected");
		
		const app = express();
		/*expressOasGenerator.init(app, {}); // to overwrite generated specification's values use second argument. */
		
		
		let MembersRouter = express.Router();
		
		let Members = require('./assets/classes/members-class')(db, config)
		console.log(Members)
		
		app.use(morgan);
		app.use(bodyParser.json()) // for parsing application/json
		app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
		app.use(config.rootAPI+'api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


		MembersRouter.route('/:id')


		//app.get('/api/v1/members/:id', (req, res) => {
			
			// Recupere un membre avec ID
			.get(async (req, res) => {
				
				let member = await Members.getById(req.params.id);
				
				res.json(checkAndChange(member)) 
				
			})

		//app.put('/api/v1/members/:id', (req, res) => {
			
			// Modifie un membre avec ID
			.put(async (req, res) => {

				let updateMember = await Members.update(req.params.id, req.body.name)
				res.json(checkAndChange(updateMember)) 
				
				
			})

		//app.delete('/api/v1/members/:id', (req, res) => {
			
			// Supprime un membre avec ID
			.delete(async(req, res) => {

				let deleteMember = await Members.delete(req.params.id)
				res.json(checkAndChange(deleteMember)) 
				
			})
			
		MembersRouter.route('/')

		//app.get('/api/v1/members/', (req, res) => {
			
			// Recupere tous les membres
			.get(async (req, res) => {

				let allMembers = await Members.getAll(req.query.max)
				res.json(checkAndChange(allMembers)) 
			})


		//app.post('/api/v1/members', (req, res) => {
			
			// Ajoute un membre
			.post(async(req, res) => {

				let addMember = await Members.add(req.body.name)
				res.json(checkAndChange(addMember)) 
				
			}
		)

		/*
		app.get('/api', (req, res) => {
			res.send('ROOT API');
		})

		app.get('/api/v1', (req, res) => {
			res.send('ROOT API Version 1');
		})

		app.get('/api/v1/books/:id', (req, res) => {
			res.send(req.params);
		})
		*/

		app.use(config.rootAPI+'members', MembersRouter)

		app.listen( config.port, () => console.log('started on port '+ config.port));
							
	
}).catch((err) => {
	console.log('Error during database connection');
	console.log(err.message);
})



/*
function getIndex(id)
{
	for(let i=0; i < members.length; i++)
	{
		if(members[i].id == id)
			return i;
	}
	return 'wrong id';
}

function createId(){
	return members[members.length -1].id +1;
}*/
