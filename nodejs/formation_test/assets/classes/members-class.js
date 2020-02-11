let db, config

module.exports = (_db, _config) => {
	db = _db,
	config = _config
	return Members
}

let Members = class{
	
	static getById(id){
		
		return new Promise((next) => {
			db.query('SELECT * from members where id = ?',  [id])
				.then((result) => {
					if(result[0] != undefined)
						next(result[0])
					else
						next(new Error(config.errors.wrongId))
				})
				.catch((err) => next(err))
		})
		
	}
	
	static getAll(max){
		
		return new Promise((next) => {
			if(max != undefined && max > 0){
					
					db.query('SELECT * from members LIMIT 0, ?', [parseInt(max)])
					.then((result) => next(result))
					.catch((err) => next(err))
				
				
			}else if(max != undefined){
				next(new Error(config.errors.wrongMaxValue));
			}else{
				
				db.query('SELECT * from members')
					.then((result) => next(result))
					.catch((err) => next(err))
			}
		})
	}
	
	static add(name) {
		
		return new Promise((next) => {
			if(name && name.trim() != '')
			{
				name = name.trim()
				
				db.query('SELECT * from members where name = ?' , [name])
					.then((result) => {
						if(result[0] != undefined)
						{
							next(new Error(config.errors.nameAlreadyIn));
						}else{
							return db.query('INSERT INTO members(name) VALUES (?)', [name])	
						}
					
					})
					.then (() => {
						return db.query('SELECT * from members where name = ?' , [name])
					})
					.then((result) => {
						next({
							id:result[0].id,
							name:result[0].name
						})
										
					})
					.catch((err) => next(err))				

			}else{
				next(new Error(config.errors.noNameValue));
			}
		
		})

	}
	
	static update(id, name) {
		
		return new Promise((next) => {
			if(name && name.trim() != '')
			{
				name = name.trim()
				
				db.query('SELECT * from members where id = ?', [id])
					.then((result) => {
						if(result[0] != undefined)
						{	
							return db.query('SELECT * from members where name = ? and id != ?', [name,id])
						}
						else
							next(new Error(config.errors.wrongId))
					})
					.then ((result) => {
						if(result[0] != undefined){
							next (new Error(config.errors.sameName))
						}
						else{
							return db.query('UPDATE members SET name = ? where id = ?' , [name,id])
						}
					})
					.then(() => next(true))
					.catch((err) => next(err))	
							
			
			}else{
				next(new Error(config.errors.noNameValue));
			}
		})
	}
	
	static delete(id) {
		return new Promise((next) => {
			db.query('SELECT * from members where id = ?', [id])
				.then((result) => {
					if(result[0] != undefined)
					{
						return db.query('DELETE from members where id =?', [id])	
					}
					else
						next(new Error(config.errors.wrongId))
				})
				.then(() => next(true))
				.catch((err) => next(err))	
		})
	}
}

