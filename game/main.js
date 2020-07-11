const WIDTH_CANVAS = 800;
const HEIGHT_CANVAS = 600;

const SPEED_DUMMY = 30;

const XOFFSET_LEVEL = 32;
const YOFFSET_LEVEL = 32;


const tilegroups = {
	null: 'walls',
	'floor1': 'below',
	'wall_left': 'walls',
	'wall_middle': 'walls',
	'wall_right': 'walls',
	'edge': 'walls'
};


document.addEventListener('DOMContentLoaded', function()
{
	const dom_container = document.getElementById('container');

	// 0: left, 1: right
	const gamestate = {
		direction_dummy: 0
	};

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
				// debug: true,
				fps: 30
			}
		},
		scene: {
			preload: function()
			{
				// load assets
				this.load.spritesheet('tileset_animation', 'assets/tileset.png', {frameWidth: 16, frameHeight: 32});
				this.load.atlas('atlas', 'assets/tileset.png', 'assets/tileset.json');

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

						const x = XOFFSET_LEVEL + index_col*16;
						const y = YOFFSET_LEVEL + index_row*16;

						if(staticgroups[tilegroup])
							staticgroups[tilegroup].create(x, y, 'atlas', tile).setDisplaySize(16, 16).refreshBody();
						else
							this.add.sprite(x, y, 'atlas', tile).setDisplaySize(16, 16);
					}
				}

				// characters
				this.anims.create({
					key: 'dummy_idle',
					frames: this.anims.generateFrameNumbers('tileset_animation', {start: 72, end: 75}),
					frameRate: 8,
					repeat: -1
				});
				this.anims.create({
					key: 'dummy_run',
					frames: this.anims.generateFrameNumbers('tileset_animation', {start: 76, end: 79}),
					frameRate: 8,
					repeat: -1
				});
				gamestate.dummy = this.physics.add.sprite(64, 64, 'tileset_animation').setOrigin(0.5, 1).play('dummy_run');
				gamestate.dummy.body.setSize(12, 12).setOffset(2, 20);

				this.anims.create({
					key: 'damsel',
					frames: this.anims.generateFrameNumbers('tileset_animation', {start: 8, end: 11}),
					frameRate: 8,
					repeat: -1
				});
				this.add.sprite(232, 150, 'tileset_animation').setOrigin(0.5, 1).play('damsel');


				this.physics.add.collider(gamestate.dummy, staticgroups.walls);


				// keyboard controls
				gamestate.cursors = this.input.keyboard.createCursorKeys();
			},
			update: function()
			{
				let moving = false;
				if(gamestate.cursors.left.isDown)
				{
					gamestate.direction_dummy = 0;
					gamestate.dummy.setVelocityX(-SPEED_DUMMY);
					moving = true;
				}
				else if(gamestate.cursors.right.isDown)
				{
					gamestate.direction_dummy = 1;
					gamestate.dummy.setVelocityX(SPEED_DUMMY);
					moving = true;
				}
				else
					gamestate.dummy.setVelocityX(0);

				if(gamestate.cursors.up.isDown)
				{
					gamestate.dummy.setVelocityY(-SPEED_DUMMY);
					moving = true;
				}
				else if(gamestate.cursors.down.isDown)
				{
					gamestate.dummy.setVelocityY(SPEED_DUMMY);
					moving = true;
				}
				else
					gamestate.dummy.setVelocityY(0);

				gamestate.dummy.anims.play(moving ? 'dummy_run' : 'dummy_idle', true);

				gamestate.dummy.setFlipX(gamestate.direction_dummy === 0);
			}
		}
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
