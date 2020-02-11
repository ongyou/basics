
require("babel-register");

const {success, error} = require('./assets/functions');

const mysql = require("mysql");

const express = require("express");


const morgan = require("morgan")('dev');

const bodyParser = require("body-parser");

const config = require("./assets/config");

/*app.use((req, res, next) => {
	console.log('URL : ' + req.url);
	next();
})*/


const db = mysql.createConnection({
	host: config.db.host,
	database : config.db.database,
	user: config.db.user, 
	password: config.db.password
})


db.connect ((err) => {
	if(err)
		console.log(err.message);
	else
	{
		console.log("connected");
		
		const app = express();
		let MembersRouter = express.Router();
		
		let Members = require('./assets/classes/members-class')(db, config)
		console.log(Members)
		
		app.use(morgan);
		app.use(bodyParser.json()) // for parsing application/json
		app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


		MembersRouter.route('/:id')


		//app.get('/api/v1/members/:id', (req, res) => {
			
			// Recupere un membre avec ID
			.get((req, res) => {
				
				db.query('SELECT * from members where id = ?', [req.params.id], (err, result) => {
					if(err)
						res.json(error(err.message))
					else{
						if(result[0] != undefined)
							res.json(success(result[0]))
						else
							res.json(error("wrong id"))
					}
				})

				/*
				let index = getIndex(req.params.id);
				
				if(typeof(index) == 'string')
				{
					res.json(error(index));
				}else{
					res.json(success(members[index]));
				}*/
				
			})

		//app.put('/api/v1/members/:id', (req, res) => {
			
			// Modifie un membre avec ID
			.put((req, res) => {

				if(req.body.name){
					db.query('SELECT * from members where id = ?', [req.params.id], (err, result) => {
						if(err)
							res.json(error(err.message))
						else{
							if(result[0] != undefined)
							{	
								db.query('SELECT * from members where name = ? and id != ?', [req.body.name,req.params.id], (err, result) => {
									if(err)
										res.json(error(err.message))
									else{
										if(result[0] != undefined){
											res.json(error('same name'))
										}
										else{
											db.query('UPDATE members SET name = ? where id = ?' , [req.body.name,req.params.id], (err, result) => {
												if(err)
													res.json(error(err.message))
												else{
													res.json(success(true))
												}
											})
										}
									}
								})
							}
							else
								res.json(error("wrong id"))
						}
					})
				}else{
					res.json(error('no name value'));
				}


				/*let index = getIndex(req.params.id);
				
				if(typeof(index) == 'string')
				{
					res.json(error(index));
				}else{
					
					let same = false;
					
					for(let i=0; i < members.length; i++)
					{
						if(req.body.name == members[i].name && req.params.id != members[i].id)
						{
							same = true; break;
						}
							
					}
					
					if(same){
						res.json(error("same name"));
					}else{
						members[index].name = req.body.name;
						res.json(success(true));
					}
					
				}*/
				
			})

		//app.delete('/api/v1/members/:id', (req, res) => {
			
			// Supprime un membre avec ID
			.delete((req, res) => {

				
				db.query('SELECT * from members where id = ?', [req.params.id], (err, result) => {
					if(err)
						res.json(error(err.message))
					else{
						if(result[0] != undefined)
						{
							db.query('DELETE from members where id =?', [req.params.id], (err, result) =>{
								if(err)
									res.json(error(err.message))
								else{
									res.json(success(true))
								}
							})
						}
						else
							res.json(error("wrong id"))
					}
				})

			/*
				let index = getIndex(req.params.id);
				
				if(typeof(index) == 'string')
				{
					res.json(error(index));
				}else{
					members.splice(index, 1);
					res.json(success(members));
				}
				*/
			})
			
		MembersRouter.route('/')

		//app.get('/api/v1/members/', (req, res) => {
			
			// Recupere tous les membres
			.get((req, res) => {

				if(req.query.max != undefined && req.query.max > 0){
					
						db.query('SELECT * from members LIMIT 0, ?', [req.query.max], (err, result) => {
						if(err)
							res.json(error(err.message))
						else{
							res.json(success(result))
						}
					})
					
				}else if(req.query.max != undefined){
					res.json(error('wrong max value'));
				}else{
					
					db.query('SELECT * from members',(err, result) => {
						if(err)
							res.json(error(err.message))
						else{
							res.json(success(result))
						}
					})
					
				}
				
			})


		//app.post('/api/v1/members', (req, res) => {
			
			// Ajoute un membre
			.post((req, res) => {

				if(req.body.name)
				{
					
					db.query('SELECT * from members where name = ?' , [req.body.name], (err, result) => {
						if(err)
						{
							res.json(error(err.message))
						}else{
							if(result[0] != undefined)
							{
								res.json(error("name already in"));
							}else{
									db.query('INSERT INTO members(name) VALUES (?)', [req.body.name], (err, result) =>{
										if(err)
											res.json(error(err.message))
										else{
											db.query('SELECT * from members where name = ?' , [req.body.name], (err, result) => {
												if(err)
												{
													res.json(error(err.message))
												}else{
													res.json(success({
														id:result[0].id,
														name:result[0].name
													}))
												}
											})
										}
									})
							}
						}
					})
					
					
					/*let sameName = false;
					
					for(let i=0 ; i < members.length; i++)
					{

						if(members[i].name == req.body.name)
						{
							sameName = true;
							break;
						}
					}
					
					if(sameName)
					{
						res.json(error('name already exist'));
					}else{
					
						let member = {
							id: createId(),
							name: req.body.name
						};
						
						members.push(member);
						
						res.json(success(member));
						
					} */
				}else{
					res.json(error('no name value'));
				}
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
							
	}
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
