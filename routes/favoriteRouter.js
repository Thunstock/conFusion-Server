const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorite');
const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');
const favoriteRouter = express.Router();
const cors = require('./cors');
var mongoose = require('mongoose');

favoriteRouter.use(bodyParser.json());

// dishIDs
// 5cb4f09933a07e1a071f9f53
// 5cb4f0a633a07e1a071f9f54
// 5cb4f0b033a07e1a071f9f55
// 5cb4f0b433a07e1a071f9f56

favoriteRouter
	.route('/')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		//get the favorites for this user
		Favorites.findOne({ user: req.user._id })
			.then((favorite) => {
				//if there are no favorites, return that exists = false
				if (!favorite) {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					return res.json(`You have no favorites!`);
				} else {
					Favorites.findById(favorite._id).populate('user').populate('dishes').then((favorite) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						return res.json(favorite);
					});
				}
			})
			.catch((err) => next(err));
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /dishes');
	})
	.post(cors.cors, authenticate.verifyUser, (req, res, next) => {
		//get the favorite document for this user
		Favorites.findOne({ user: req.user._id })
			.then((favorite) => {
				// if no favorites currently exist for this user...
				if (!favorite) {
					//create a new document and add the dishes in the request body
					Favorites.create({ user: req.user._id, dishes: req.body }, (err, doc) => {
						if (err) {
							return next(err);
						} else {
							console.log('Document inserted');
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							return res.json(doc);
						}
					});
				} else {
					//there is already a populated favorites document for this user
					//add each dish to favorites that is not already in the favorites array
					for (i = 0; i < req.body.length; i++) {
						if (favorite.dishes.indexOf(req.body[i]._id) < 0) {
							favorite.dishes.push(req.body[i]);
						}
					}
					favorite
						.save()
						.then((favorite) => {
							Favorites.findById(favorite._id)
								//.populate('user')
								//.populate('dishes')
								.then((favorite) => {
									res.statusCode = 200;
									res.setHeader('Content-Type', 'application/json');
									res.json(favorite);
								});
						})
						.catch((err) => {
							return next(err);
						});
				}
			})
			.catch((err) => {
				return next(err);
			});
	})
	.delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
		Favorites.remove({})
			.then(
				(resp) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(resp);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	});

favoriteRouter
	.route('/:dishId')
	.options(cors.corsWithOptions, (req, res) => {
		res.sendStatus(200);
	})
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		//get the favorites for this user
		Favorites.findOne({ user: req.user._id })
			.then((favorite) => {
				//if there are no favorites, return that exists = false
				if (!favorite) {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					return res.json(`You have no favorites!`);
				} else {
					// if the dish doesn't exist in the list of favorites, return exists as false
					if (favorite.dishes.indexOf(req.params.dishId) < 0) {
						Dishes.findById(req.params.dishId).then((dish) => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							return res.json(`${dish.name} is not in your favorites!`);
						});
					} else {
						//(favorite.dishes.indexOf(req.params.dishId) > -1) : the dish is a favorite, return the dish
						Favorites.findById(favorite._id).populate('user').populate('dishes').then((favorite) => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							return res.json(favorite);
						});
					}
				}
			})
			.catch((err) => next(err));
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /dishes');
	})
	.post(cors.cors, authenticate.verifyUser, (req, res, next) => {
		//get the favorite document for this user
		Favorites.findOne({ user: req.user._id })
			.then((favorite) => {
				if (!favorite) {
					//create a new document and add the dishes in the request body
					Favorites.create({ user: req.user._id, dishes: [ req.params.dishId ] }, (err, doc) => {
						if (err) {
							return next(err);
						} else {
							console.log('Document inserted');
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							return res.json(doc);
						}
					});
				} else if (favorite.dishes.indexOf(req.params.dishId) > -1) {
					//dish already exists in favorites, return the dish with a message
					Dishes.findById(req.params.dishId)
						.then(
							(dish) => {
								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								res.json(`${dish.name} is already a favorite!`);
							},
							(err) => next(err)
						)
						.catch((err) => {
							return next(err);
						});
				} else if (favorite.dishes.indexOf(req.params.dishId) < 0) {
					//if dish is not a favorite, ad the user id, push the
					// dishId, and report by populating these fields
					req.body.user = req.user._id;
					favorite.dishes.push({ _id: req.params.dishId });
					favorite
						.save()
						.then((favorite) => {
							Favorites.findById(favorite._id).populate('user').populate('dishes').then((favorite) => {
								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								return res.json(favorite);
							});
						})
						.catch((err) => {
							return next(err);
						});
				}
			})
			.catch((err) => {
				return next(err);
			});
	})
	.delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
		Favorites.findOne({ user: req.user._id })
			.then((favorite) => {
				if (!favorite) {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					return res.json(`You have no favorites to delete!`);
				} else if (favorite.dishes.indexOf(req.params.dishId) < 0) {
					//if dish is not a favorite
					Dishes.findById(req.params.dishId)
						.then(
							(dish) => {
								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								return res.json(
									`${dish.name} cannot be deleted from your favorites because it is not a favorite.`
								);
							},
							(err) => next(err)
						)
						.catch((err) => {
							return next(err);
						});
				} else if (favorite.dishes.indexOf(req.params.dishId) > -1) {
					//dish exists in favorites, delete it from favorites {pull}
					favorite.dishes.pull(req.params.dishId);
					favorite.save();
					Dishes.findById(req.params.dishId)
						.then(
							(dish) => {
								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								res.json(`${dish.name} was deleted from  your favorites.`);
							},
							(err) => next(err)
						)
						.catch((err) => {
							return next(err);
						});
				}
			})
			.catch((err) => {
				return next(err);
			});
	});

module.exports = favoriteRouter;
