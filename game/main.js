const WIDTH_CANVAS = 800;
const HEIGHT_CANVAS = 600;

const XOFFSET_LEVEL = 64;
const YOFFSET_LEVEL = 48;

const WIDTH_TILE = 16;
const HEIGHT_TILE = 16;

const THINK_SPEED = 0.05;

const LIGHT_INTENSITY = 2;
const DIM_RADIUS = 48;
const LIT_RADIUS = 24;
const LIGHT_RADIUS = 60;

const WIN_RADIUS = 40;


const tilegroups = {
	null: 'walls',
	'floor1': 'below',
	'floor2': 'below',
	'floor3': 'below',
	'floor4': 'below',
	'floor5': 'below',
	'floor6': 'below',
	'floor7': 'below',
	'floor8': 'below',
	'floor_ladder': 'below',
	'feature_lava_base1': 'below',
	'wall_left': 'walls',
	'wall_middle': 'walls',
	'wall_right': 'walls',
	'wall_top_middle': 'walls',
	'wall_variant1': 'walls',
	'wall_variant2': 'walls',
	'wall_variant3': 'walls',
	'wall_variant4': 'walls',
	'wall_variant5': 'walls',
	'wall_variant6': 'walls',
	'wall_side_mid_left': 'walls',
	'wall_side_mid_right': 'walls',
	'wall_corner_bottom_left': 'walls',
	'wall_corner_bottom_right': 'walls',
	'feature_lava_mid1': 'walls',
	'edge': 'walls'
};


function makegraph(level, tilegroups, state)
{
	const nodes = level.tiles.map(function(row, index_row)
	{
		return row.map(function(tile, index_col)
		{
			if(tilegroups[tile] === 'below' || tile === null || tile === 'edge')
			{
				const node = {
					index_row,
					index_col,
					x: XOFFSET_LEVEL + WIDTH_TILE*index_col,
					y: YOFFSET_LEVEL + HEIGHT_TILE*index_row,
					paths: []
				};
				if(tile === null || tile === 'edge')
					node.hazard = true;
				if(tile === 'floor_ladder')
				{
					node.win = true;
					state.nodes_win.push(node);
				}

				return node;
			}

			return null;
		});
	});

	nodes.forEach(function(row)
	{
		row.forEach(function(node)
		{
			if(node === null)
				return;

			const nodes_adjacent = [];
			if(node.index_row > 0 && nodes[node.index_row - 1][node.index_col] !== null)
				nodes_adjacent.push(nodes[node.index_row - 1][node.index_col]);
			if(node.index_row < nodes.length - 1 && nodes[node.index_row + 1][node.index_col] !== null)
				nodes_adjacent.push(nodes[node.index_row + 1][node.index_col]);
			if(node.index_col > 0 && nodes[node.index_row][node.index_col - 1] !== null)
				nodes_adjacent.push(nodes[node.index_row][node.index_col - 1]);
			if(node.index_col < row.length - 1 && nodes[node.index_row][node.index_col + 1] !== null)
				nodes_adjacent.push(nodes[node.index_row][node.index_col + 1]);

			nodes_adjacent.forEach(function(node_adjacent)
			{
				if(node_adjacent !== null)
					node.paths.push(node_adjacent);
			});
		});
	});

	return nodes;
}

function lightgraph(graph, sconces)
{
	for(let index_row = 0; index_row < graph.length; ++index_row)
	{
		const row = graph[index_row];

		for(let index_col = 0; index_col < row.length; ++index_col)
		{
			const node = row[index_col];
			if(node === null)
				continue;

			node.lit = false;
			node.dim = false;
			for(let index_sconce = 0; index_sconce < sconces.length; ++index_sconce)
			{
				const sconce = sconces[index_sconce];
				if(!sconce.lit)
					continue;

				const dx = sconce.x - node.x;
				const dy = sconce.y - node.y;

				if(dx*dx + dy*dy <= LIT_RADIUS*LIT_RADIUS)
					node.lit = true;
				if(dx*dx + dy*dy <= DIM_RADIUS*DIM_RADIUS)
					node.dim = true;
			}
		}
	}
}

function closestlit(start, graph)
{
	const visited = new Map();
	visited.set(start);

	return closestlit_recurse(start, graph, visited, []);
}

// start, graph, new Map()
function closestlit_recurse(current, graph, visited, queue)
{
	if(current.lit && !current.hazard)
		return current;

	for(let index_path = 0; index_path < current.paths.length; ++index_path)
	{
		const node = current.paths[index_path];
		if(node === null)
			continue;

		if(!visited.has(node))
		{
			visited.set(node);
			queue.push(node);
		}
	}

	while(queue.length > 0)
		return closestlit_recurse(queue.shift(), graph, visited, queue);

	return null;
}

function heuristic(start, goal)
{
	const dx = goal.index_col - start.index_col;
	const dy = goal.index_row - start.index_row;

	return Math.sqrt(dx*dx + dy*dy);
}

function reconstruct(from, current)
{
	const path = [current];

	while(from.has(current))
	{
		current = from.get(current);
		path.unshift(current);
	}

	return path;
}

function findpath(start, goal, dummy_mood)
{
	const openset = [start];
	const from = new Map();

	const score_g = new Map();
	score_g.set(start, 0);

	const score_f = new Map();
	score_f.set(start, heuristic(start, goal));
	while(openset.length > 0)
	{
		const current = openset.shift();
		if(current === goal)
			return reconstruct(from, current);

		for(let index_path = 0; index_path < current.paths.length; ++index_path)
		{
			const node_adj = current.paths[index_path];
			if(dummy_mood !== 'scared' && node_adj.hazard)
				continue;

			const score_g_temp = score_g.get(current) + 1;
			const score_g_adj = score_g.has(node_adj) ? score_g.get(node_adj) : Infinity;
			if(score_g_temp < score_g_adj)
			{
				from.set(node_adj, current);
				score_g.set(node_adj, score_g_temp);

				const score_f_adj = score_g_temp + heuristic(node_adj, goal);
				score_f.set(node_adj, score_f_adj);

				// TODO(shawn): maybe implement heap for quicker insertion
				let index_node;
				for(index_node = 0; index_node < openset.length; ++index_node)
					if(score_f_adj < score_f.get(openset[index_node]))
						break;

				openset.splice(index_node, 0, node_adj);
			}
		}
	}

	return [];
}

const mood_handler = {
	calm: function(state)
	{
		// randomly decide to set a new destination when calm
		if(state.actionqueue.length === 0 && state.action_current === null && Math.floor(Math.random()*240) < 1)
		{
			const visited = new Map();
			visited.set(state.node_current);

			let distance = Math.floor(Math.random()*5) + 1;

			let node_destination = state.node_current;
			while(distance > 0)
			{
				const nodes_possible = [];
				for(let index_path = 0; index_path < node_destination.paths.length; ++index_path)
				{
					const node = node_destination.paths[index_path];

					if(!node.hazard && !visited.has(node))
						nodes_possible.push(node);
				}

				if(nodes_possible.length === 0)
					break;

				node_destination = nodes_possible[Math.floor(Math.random()*nodes_possible.length)];

				--distance;
			}

			if(node_destination !== state.node_current)
				state.actionqueue.push({
					type: 'think',
					duration: Math.random()*4 + 2
				},
				{
					type: 'move',
					node_destination: node_destination,
					index_path: 0,
					progress_path: 0,
					path: null
				});
		}

		let moving_for_the_win = false;
		for(let i = 0; i < state.actionqueue.length; ++i)
		{
			const action = state.actionqueue[i];
			if(state.nodes_win.includes(action.node_destination))
			{
				moving_for_the_win = true;
				break;
			}
		}
		if(state.action_current !== null && state.nodes_win.includes(state.action_current.node_destination))
			moving_for_the_win = true;
		if(!moving_for_the_win)
		{
			for(let index_node_win = 0; index_node_win < state.nodes_win.length; ++index_node_win)
			{
				const node_win = state.nodes_win[index_node_win];

				const dx = node_win.x - state.node_current.x;
				const dy = node_win.y - state.node_current.y;

				if(dx*dx + dy*dy <= WIN_RADIUS*WIN_RADIUS)
				{
					state.action_current = null;
					state.actionqueue.push({
						type: 'think',
						duration: Math.random()*1 + 2
					}, {
						type: 'move',
						node_destination: node_win,
						index_path: 0,
						progress_path: 0,
						path: null
					});
					break;
				}
			}
		}
		else
			state.dummy_thought.anims.play('thought_exit', true);

		if(!state.node_current.dim)
			changemood(state, 'scared');
	},
	scared: function(state)
	{
		if(state.node_current.lit)
			changemood(state, 'calm');
		else
		{
			const destination = closestlit(state.node_current, state.graph);
			if(destination !== null && (state.action_current === null || (state.action_current.type === 'move' && destination !== state.action_current.node_destination)))
			{
				state.action_current = null;
				state.actionqueue.push({
					type: 'move',
					node_destination: destination,
					index_path: 0,
					progress_path: 0,
					path: null
				});
			}
		}

		if(state.actionqueue.length === 0 && state.action_current === null && Math.floor(Math.random() * 60) < 1)
		{
			let end_node = state.node_current.paths[Math.floor(Math.random() * state.node_current.paths.length)];
			let distance = 1;
			while(distance < 9)
			{
				end_node = end_node.paths[Math.floor(Math.random() * end_node.paths.length)];
				distance++;
			}
			if(end_node !== state.node_current)
			{
				state.actionqueue.push({
					type: 'move',
					node_destination: end_node,
					index_path: 0,
					progress_path: 0,
					path: null
				});
			}
		}
	}
};

function changemood(state, mood)
{
	if(state.changing_moods)
		return;

	state.changing_moods = true;

	state.action_current = null;
	state.actionqueue = [];

	state.actionqueue.push({
		type: 'think',
		duration: Math.random() + 1
	},
	{
		type: 'mood',
		mood: mood
	});
}

document.addEventListener('DOMContentLoaded', function()
{
	const dom_container = document.getElementById('container');

	const state = {
		dummy: null,
		graph: null,
		sconces: [],
		// false: left, true: right
		direction_dummy: 0,
		node_current: null,
		actionqueue: [],
		action_current: null,
		// normalized tile units per frame
		dummy_speed: 0.03,

		dummy_mood: 'calm',
		changing_moods: false,

		win: false,
		lose: false,
		nodes_win: []
	};

	const game_scene = new Phaser.Class({
		Extends: Phaser.Scene,
		initialize: function()
		{
			Phaser.Scene.call(this, {key: 'game_scene', active: true});
		},

		preload: function()
		{
			// load assets
			// phaser is bad so we need to do this, and by need I mean I don't know how to do it in phaser
			this.load.atlas('atlas', ['assets/tileset.png', 'assets/normal.png'], 'assets/tileset.json');
			this.load.json('level0', 'assets/levels/level0.json');
			this.load.json('level1', 'assets/levels/level1.json');
			this.load.json('level2', 'assets/levels/level2.json');
		},

		create: function()
		{
			this.lights.enable().setAmbientColor(0x303840);

			const level = this.cache.json.get('level1');

			state.graph = makegraph(level, tilegroups, state);
			const node_spawn = state.graph[3][2];
			state.node_current = node_spawn;

			// character animations
			this.anims.create({
				key: 'dummy_idle',
				frames: this.anims.generateFrameNames('atlas', {prefix: 'knight_idle', end: 4}),
				frameRate: 6,
				repeat: -1
			});
			this.anims.create({
				key: 'dummy_run',
				frames: this.anims.generateFrameNames('atlas', {prefix: 'knight_run', end: 4}),
				frameRate: 8,
				repeat: -1
			});
			this.anims.create({
				key: 'dummy_idle_scared',
				frames: this.anims.generateFrameNames('atlas', {prefix: 'knight_idle', end: 4}),
				frameRate: 8,
				repeat: -1
			});
			this.anims.create({
				key: 'dummy_run_scared',
				frames: this.anims.generateFrameNames('atlas', {prefix: 'knight_run', end: 4}),
				frameRate: 12,
				repeat: -1
			});
			this.anims.create({
				key: 'dummy_fall',
				frames: this.anims.generateFrameNames('atlas', {prefix: 'knight_fall', end: 5}),
				frameRate: 8
			});

			// mood animations
			this.anims.create({
				key: 'thought_think',
				frames: this.anims.generateFrameNames('atlas', {prefix: 'thought_think', end: 4}),
				frameRate: 2,
				repeat: -1
			});
			this.anims.create({
				key: 'thought_fear',
				frames: [{key: 'atlas', frame: 'thought_fear'}],
				frameRate: 1
			});
			this.anims.create({
				key: 'thought_surprise',
				frames: [{key: 'atlas', frame: 'thought_surprise'}],
				frameRate: 1
			});
			this.anims.create({
				key: 'thought_exit',
				frames: [{key: 'atlas', frame: 'thought_exit'}],
				frameRate: 1
			});
			this.anims.create({
				key: 'thought_none',
				frames: [{key: 'atlas', frame: 'thought_none'}],
				frameRate: 1
			});

			// sconce animations
			this.anims.create({
				key: 'sconce_unlit',
				frames: [{key: 'atlas', frame: 'sconce_unlit'}],
				frameRate: 1
			});
			this.anims.create({
				key: 'sconce_lit',
				frames: this.anims.generateFrameNames('atlas', {prefix: 'sconce_lit', end: 2}),
				frameRate: 3,
				repeat: -1
			});
			this.anims.create({
				key: 'sconce_unlit_outline',
				frames: [{key: 'atlas', frame: 'sconce_unlit_outline'}],
				frameRate: 1
			});
			this.anims.create({
				key: 'sconce_lit_outline',
				frames: this.anims.generateFrameNames('atlas', {prefix: 'sconce_lit_outline', end: 2}),
				frameRate: 3,
				repeat: -1
			});

			// render lower level layer
			for(let index_row = 0; index_row < level.tiles.length; ++index_row)
			{
				const row = level.tiles[index_row];

				for(let index_col = 0; index_col < row.length; ++index_col)
				{
					const tile = row[index_col];

					const x = XOFFSET_LEVEL + index_col*WIDTH_TILE;
					const y = YOFFSET_LEVEL + index_row*HEIGHT_TILE;

					const sprite = this.add.sprite(x, y, 'atlas', tile).setDisplaySize(WIDTH_TILE, HEIGHT_TILE);
					sprite.setPipeline('Light2D');
				}
			}

			for(let index_object = 0; index_object < level.objects.length; ++index_object)
			{
				const object = level.objects[index_object];

				if(object.key === 'sconce')
				{
					const x = XOFFSET_LEVEL + object.col*WIDTH_TILE;
					const y = YOFFSET_LEVEL + object.row*HEIGHT_TILE;

					const sconce = {
						light: this.lights.addLight(x, y + HEIGHT_TILE/2, LIGHT_RADIUS).setColor(0xffe8b0).setIntensity(object.lit ? LIGHT_INTENSITY : 0),
						sprite: this.add.sprite(x, y, 'atlas', 'sconce_unlit').setPipeline('Light2D').anims.play(object.lit ? 'sconce_lit' : 'sconce_unlit'),
						lit: object.lit,
						x: x,
						y: y + HEIGHT_TILE
					};
					state.sconces.push(sconce);

					sconce.sprite.setInteractive({
						useHandCursor: true
					});
					sconce.sprite.on('pointerup', function()
					{
						if(!sconce.lit && state.ux_stored_light.available > 0)
						{
							sconce.lit = true;
							sconce.light.setIntensity(LIGHT_INTENSITY);
							sconce.sprite.anims.play('sconce_lit_outline');

							state.ux_stored_light.sprites[--state.ux_stored_light.available].anims.remove('sconce_lit');
							state.ux_stored_light.sprites[state.ux_stored_light.available].anims.play('sconce_unlit');
						}
						else if(sconce.lit && state.ux_stored_light.available < 3)
						{
							sconce.lit = false;
							sconce.light.setIntensity(0);
							sconce.sprite.anims.play('sconce_unlit_outline');

							state.ux_stored_light.sprites[state.ux_stored_light.available].anims.play('sconce_lit');
							state.ux_stored_light.sprites[state.ux_stored_light.available++].anims.remove('sconce_unlit');
						}

						lightgraph(state.graph, state.sconces);
					});
					sconce.sprite.on('pointermove', function()
					{
						sconce.sprite.anims.play(sconce.lit ? 'sconce_lit_outline' : 'sconce_unlit_outline');
					});
					sconce.sprite.on('pointerout', function()
					{
						sconce.sprite.anims.play(sconce.lit ? 'sconce_lit' : 'sconce_unlit');
					});
				}
			}

			lightgraph(state.graph, state.sconces);

			state.dummygroup = this.add.group();

			// initialize character
			state.dummy = state.dummygroup.create(0, 0, 'atlas').setOrigin(0.5, 1);
			state.dummy.setPipeline('Light2D');
			// dummy.body.setSize(12, 6).setOffset(2, 28);

			state.dummy_thought = state.dummygroup.create(0, 0, 'atlas');
			state.dummy_thought.anims.play('thought_none');
			state.dummy_thought.setDisplayOrigin(5, 31);

			state.dummygroup.setXY(XOFFSET_LEVEL + node_spawn.index_col*WIDTH_TILE, YOFFSET_LEVEL + node_spawn.index_row*HEIGHT_TILE);


			// render upper level layer
			for(let index_row = 0; index_row < level.tiles_top.length; ++index_row)
			{
				const row = level.tiles_top[index_row];

				for(let index_col = 0; index_col < row.length; ++index_col)
				{
					const tile = row[index_col];

					const x = XOFFSET_LEVEL + index_col*WIDTH_TILE;
					const y = YOFFSET_LEVEL + index_row*HEIGHT_TILE;

					const sprite = this.add.sprite(x, y, 'atlas', tile).setDisplaySize(WIDTH_TILE, HEIGHT_TILE);

					sprite.setPipeline('Light2D');
				}
			}
		},

		update: function()
		{
			if(state.node_current.win)
			{
				if(!state.win)
				{
					state.win = true;
					this.add.text(0, 24, 'You Win POGGERS', {fontFamily: 'nightie', fontSize: '27px', fixedWidth: this.game.canvas.width, fixedHeight: 32, align: 'center'}).setOrigin(0, 0);
				}
				return;
			}
			if(state.node_current.hazard)
			{
				if(!state.lose)
				{
					state.lose = true;
					state.dummy.anims.play('dummy_fall');
					this.add.text(0, 24, 'You Died Idiot kekw', {fontFamily: 'nightie', fontSize: '27px', fixedWidth: this.game.canvas.width, fixedHeight: 32, align: 'center'}).setOrigin(0, 0);
				}

				return;
			}
			const action = state.action_current;

			// if idle, perform next action when applicable
			if(action !== null)
			{
				if(action.type === 'think')
				{
					if(state.dummy_mood === 'calm')
						state.dummy_thought.anims.play('thought_think', true);

					action.duration -= THINK_SPEED;
					if(action.duration <= 0)
					{
						state.action_current = null;
						state.dummy_thought.anims.play('thought_none', true);
					}
				}
				else if(action.type === 'move')
				{
					if(action.path === null)
					{
						action.path = findpath(state.node_current, action.node_destination, state.dummy_mood);
						action.path[0] = {
							x: state.dummy.x,
							y: state.dummy.y
						};
					}

					if(action.path.length > 1)
					{
						action.progress_path += state.dummy_speed;
						while(action.progress_path > 1)
						{
							action.index_path++;
							if(action.index_path === action.path.length - 1)
							{
								const node_end = action.path[action.index_path];

								state.dummygroup.setXY(node_end.x, node_end.y);
								state.node_current = node_end;
								state.action_current = null;
							}
							else
								action.progress_path -= 1;
						}

						if(state.action_current !== null)
						{
							const node_from = action.path[action.index_path];
							const node_to = action.path[action.index_path + 1];

							if(node_from.x !== node_to.x)
								state.direction_dummy = node_to.x < node_from.x;

							if(action.index_path !== 0)
								state.node_current = node_from;

							const x = Math.floor(node_from.x*(1 - action.progress_path) + node_to.x*action.progress_path);
							const y = Math.floor(node_from.y*(1 - action.progress_path) + node_to.y*action.progress_path);

							state.dummygroup.setXY(x, y);
						}

						state.dummy.anims.play(state.dummy_mood === 'scared' ? 'dummy_run_scared' : 'dummy_run', true);
					}
				}
				else if(action.type === 'mood')
				{
					state.dummy_mood = action.mood;
					state.action_current = null;
					state.dummy_speed = action.mood === 'scared' ? 0.06 : 0.03;

					state.changing_moods = false;

					if(action.mood === 'scared')
						state.dummy_thought.anims.play('thought_surprise', true);
					else if(action.mood === 'calm')
						state.dummy_thought.anims.play('thought_none', true);
				}
			}

			if(action === null)
			{
				state.dummy.anims.play(state.dummy_mood === 'scared' ? 'dummy_idle_scared' : 'dummy_idle', true);

				if(state.actionqueue.length > 0)
					state.action_current = state.actionqueue.shift();
			}

			state.dummy.setFlipX(state.direction_dummy);

			if(state.dummy_mood === 'calm')
				mood_handler.calm(state);
			else if(state.dummy_mood === 'scared')
				mood_handler.scared(state);
		}
	});

	const ux_scene = new Phaser.Class({
		Extends: Phaser.Scene,
		initialize: function ux_scene()
		{
			Phaser.Scene.call(this, {key: 'ux_scene', active: true});
		},
		preload: function()
		{
			this.load.atlas('atlas', ['assets/tileset.png', 'assets/normal.png'], 'assets/tileset.json');
		},
		create: function()
		{
			state.ux_stored_light = {
				sprites: [
					this.add.sprite(164, 10, 'atlas', 'sconce_unlit'),
					this.add.sprite(185, 10, 'atlas', 'sconce_unlit'),
					this.add.sprite(206, 10, 'atlas', 'sconce_unlit')
				],
				available: 0
			};

			const level_text = this.add.text(this.game.canvas.width/2, this.game.canvas.height/2, 'Upper Dungeon - 1', {fontFamily: 'nightie', fontSize: '27px', backgroundColor: 0x303030, fixedWidth: this.game.canvas.width, fixedHeight: 32, align: 'center'});
			level_text.setOrigin(0.5, 0.5);
			level_text.font = 'nightie';

			this.tweens.addCounter({
				from: 1,
				to: 0,
				duration: 2000,
				onUpdate: function(tween)
				{
					level_text.setAlpha(tween.getValue());
				}
			});
		}
	});

	const game = new Phaser.Game({
		type: Phaser.AUTO,
		title: 'GMTK 2020',
		parent: dom_container,
		width: WIDTH_CANVAS/2,
		height: HEIGHT_CANVAS/2,
		resolution: 5,
		backgroundColor: 0x0a0808,
		physics: {
			default: 'arcade',
			arcade: {
				// debug: true,
				fps: 30
			}
		},
		scene: [game_scene, ux_scene]
	});

	function resize()
	{
		let w = window.innerWidth;
		let h = window.innerHeight;

		const r = HEIGHT_CANVAS/WIDTH_CANVAS;

		if(w*r > window.innerHeight)
			w = Math.min(w, Math.ceil(h/r), 800);
		h = Math.floor(w*r);

		dom_container.style.width = game.canvas.style.width = `${w}px`;
		dom_container.style.height = game.canvas.style.height = `${h}px`;
		dom_container.style.top = `${Math.floor((window.innerHeight - h)/2)}px`;
		dom_container.style.left = `${Math.floor((window.innerWidth - w)/2)}px`;
	}

	window.addEventListener('resize', resize);
	resize();
});
