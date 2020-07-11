const WIDTH_CANVAS = 800;
const HEIGHT_CANVAS = 600;

// normalized tile units per frame
const SPEED_DUMMY = 0.03;

const XOFFSET_LEVEL = 64;
const YOFFSET_LEVEL = 48;

const WIDTH_TILE = 16;
const HEIGHT_TILE = 16;


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
	'wall_left': 'walls',
	'wall_middle': 'walls',
	'wall_right': 'walls',
	'edge': 'walls'
};


function makegraph(level, tilegroups)
{
	const nodes = level.tiles.map(function(row, index_row)
	{
		return row.map(function(tile, index_col)
		{
			if(tilegroups[tile] === 'below')
				return {
					index_row,
					index_col,
					paths: []
				};
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

function findpath(start, goal)
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

document.addEventListener('DOMContentLoaded', function()
{
	const dom_container = document.getElementById('container');

	const state = {
		// false: left, true: right
		direction_dummy: 0,
		node_current: null,

		actionqueue: [],
		action_current: null
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
			this.load.atlas('atlas', ['assets/tileset.png', 'assets/normal.png'], 'assets/tileset.json');

			this.load.json('level1', 'assets/levels/level1.json');
		},

		create: function()
		{
			const staticgroups = {
				walls: this.physics.add.staticGroup()
			};

			// render level
			const level = this.cache.json.get('level1');
			for(let index_row = 0; index_row < level.tiles.length; ++index_row)
			{
				const row = level.tiles[index_row];

				for(let index_col = 0; index_col < row.length; ++index_col)
				{
					const tile = row[index_col];

					const tilegroup = tilegroups[tile];

					const x = XOFFSET_LEVEL + index_col*WIDTH_TILE;
					const y = YOFFSET_LEVEL + index_row*HEIGHT_TILE;

					const sprite = this.add.sprite(x, y, 'atlas', tile).setDisplaySize(WIDTH_TILE, HEIGHT_TILE);
					if(staticgroups[tilegroup])
						staticgroups[tilegroup].add(sprite);

					sprite.setPipeline('Light2D');
				}
			}

			this.lights.enable().setAmbientColor(0x333333);
			this.lights.addLight(0, 0, 200).setColor(0xffffff).setIntensity(2);

			const graph = makegraph(level, tilegroups);

			const node_spawn = graph[3][2];
			state.node_current = node_spawn;

			state.actionqueue.push({
				type: 'move',
				node_destination: graph[9][0],
				index_path: 0,
				progress_path: 0,
				path: null
			});
			state.actionqueue.push({
				type: 'move',
				node_destination: graph[2][9],
				index_path: 0,
				progress_path: 0,
				path: null
			});

			// characters
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
			state.dummy = this.physics.add.sprite(XOFFSET_LEVEL + node_spawn.index_col*WIDTH_TILE, YOFFSET_LEVEL + node_spawn.index_row*HEIGHT_TILE, 'atlas').setOrigin(0.5, 1);
			state.dummy.setPipeline('Light2D');
			state.dummy.body.setSize(12, 6).setOffset(2, 28);

			// this.anims.create({
			// 	key: 'damsel',
			// 	frames: this.anims.generateFrameNames('tileset_animation', {start: 8, end: 11}),
			// 	frameRate: 8,
			// 	repeat: -1
			// });
			// const damsel = this.add.sprite(232, 150, 'tileset_animation').setDisplayOrigin(8, 28).play('damsel');
			// damsel.setPipeline('Light2D');


			// this.physics.add.collider(state.dummy, staticgroups.walls);

		},

		update: function()
		{
			const action = state.action_current;

			// if idle, perform next action when applicable
			if(action !== null)
			{
				if(action.type === 'move')
				{
					if(action.path === null)
						action.path = findpath(state.node_current, action.node_destination);

					action.progress_path += SPEED_DUMMY;
					while(action.progress_path > 1)
					{
						action.index_path++;
						if(action.index_path === action.path.length - 1)
						{
							const node_end = action.path[action.index_path];

							state.dummy.setPosition(XOFFSET_LEVEL + WIDTH_TILE*node_end.index_col, YOFFSET_LEVEL + HEIGHT_TILE*node_end.index_row);
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

						if(node_from.index_col !== node_to.index_col)
							state.direction_dummy = node_to.index_col < node_from.index_col;

						state.node_current = action.progress_path < 0.5 ? node_from : node_to;

						const x = Math.floor(XOFFSET_LEVEL + WIDTH_TILE*(node_from.index_col*(1 - action.progress_path) + node_to.index_col*action.progress_path));
						const y = Math.floor(YOFFSET_LEVEL + HEIGHT_TILE*(node_from.index_row*(1 - action.progress_path) + node_to.index_row*action.progress_path));

						state.dummy.setPosition(x, y);
					}

					state.dummy.anims.play('dummy_run', true);
				}
			}
			else
			{
				state.dummy.anims.play('dummy_idle', true);

				if(state.actionqueue.length > 0)
					state.action_current = state.actionqueue.shift();
			}

			state.dummy.setFlipX(state.direction_dummy);
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
			this.load.atlas('atlas_ux', 'assets/ux.png', 'assets/ux.json');
		},
		create: function()
		{
			// render overloard controls
			this.add.sprite(0, 0, 'atlas_ux', 'ux_heart_full').setOrigin(0, 0);
			this.add.sprite(36, 0, 'atlas_ux', 'ux_heart_half').setOrigin(0, 0);
			this.add.sprite(72, 0, 'atlas_ux', 'ux_heart_empty').setOrigin(0, 0);

			const snuff_out = this.add.sprite(304, 0, 'atlas_ux', 'ux_snuff_out').setOrigin(0, 0);
			snuff_out.setInteractive({
				useHandCursor: true
			});
			snuff_out.on('pointerdown', function(pointer)
			{
				this.setTint(0xff0000);
			});

			snuff_out.on('pointerout', function(pointer)
			{
				this.clearTint();
			});

			const sound = this.add.sprite(336, 0, 'atlas_ux', 'ux_sound').setOrigin(0, 0);
			sound.setInteractive({
				useHandCursor: true
			});
			sound.on('pointerdown', function(pointer)
			{
				this.setTint(0xff0000);
			});

			sound.on('pointerout', function(pointer)
			{
				this.clearTint();
			});

			const door_collapse = this.add.sprite(368, 0, 'atlas_ux', 'ux_door_collapse').setOrigin(0, 0);
			door_collapse.setInteractive({
				useHandCursor: true
			});
			door_collapse.on('pointerdown', function(pointer)
			{
				this.setTint(0xff0000);
			});

			door_collapse.on('pointerout', function(pointer)
			{
				this.clearTint();
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
		physics: {
			default: 'arcade',
			arcade: {
				debug: true,
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
			w = Math.min(w, Math.ceil(h/r));
		h = Math.floor(w*r);

		dom_container.style.width = game.canvas.style.width = `${w}px`;
		dom_container.style.height = game.canvas.style.height = `${h}px`;
		dom_container.style.top = `${Math.floor((window.innerHeight - h)/2)}px`;
		dom_container.style.left = `${Math.floor((window.innerWidth - w)/2)}px`;
	}

	window.addEventListener('resize', resize);
	resize();
});
