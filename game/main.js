const WIDTH_CANVAS = 800;
const HEIGHT_CANVAS = 600;


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
			default: 'arcade'
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
				// render level
				const level = this.cache.json.get('level1');
				for(let index_row = 0; index_row < level.tiles.length; ++index_row)
				{
					const row = level.tiles[index_row];

					for(let index_col = 0; index_col < row.length; ++index_col)
					{
						const tile = row[index_col];

						if(tile)
							this.add.tileSprite(index_col*16, index_row*16, 16, 16, 'atlas', tile).setOrigin(0, 0);
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
				gamestate.dummy = this.physics.add.sprite(200, 150, 'dummy').play('dummy_run');

				this.anims.create({
					key: 'damsel',
					frames: this.anims.generateFrameNumbers('tileset_animation', {start: 8, end: 11}),
					frameRate: 8,
					repeat: -1
				});
				this.add.sprite(232, 150, 'damsel').play('damsel');


				// keyboard controls
				gamestate.cursors = this.input.keyboard.createCursorKeys();
			},
			update: function()
			{
				if(gamestate.cursors.left.isDown)
				{
					gamestate.direction_dummy = 0;
					gamestate.dummy.setX(gamestate.dummy.getX() - 1);
					gamestate.dummy.anims.play('dummy_run', true);
				}
				else if(gamestate.cursors.right.isDown)
				{
					gamestate.direction_dummy = 1;
					gamestate.dummy.setVelocityX(64);
					gamestate.dummy.anims.play('dummy_run', true);
				}
				else
				{
					gamestate.dummy.setVelocityX(0);
					gamestate.dummy.anims.play('dummy_idle', true);
				}

				if(gamestate.cursors.up.isDown)
				{
					gamestate.dummy.setVelocityY(-64);
					gamestate.dummy.anims.play('dummy_run', true);
				}
				else if(gamestate.cursors.down.isDown)
				{
					gamestate.dummy.setVelocityY(64);
					gamestate.dummy.anims.play('dummy_run', true);
				}
				else
					gamestate.dummy.setVelocityY(0);

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
