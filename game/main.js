const WIDTH_CANVAS = 800;
const HEIGHT_CANVAS = 600;


document.addEventListener('DOMContentLoaded', function()
{
	const dom_container = document.getElementById('container');

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
				gravity: {y: 200}
			}
		},
		scene: {
			preload: function()
			{
				// load assets
				this.load.spritesheet('tileset_animation', 'assets/tileset.png', {frameWidth: 16, frameHeight: 32}
				);

				this.load.atlas('atlas', 'assets/tileset.png', 'assets/tileset.json');
			},
			create: function()
			{
				// walls
				this.add.tileSprite(0, 0, 16, 16, 'atlas', 'wall_top_left');
				this.add.tileSprite(16, 0, 16, 16, 'atlas', 'wall_top_middle');
				this.add.tileSprite(32, 0, 16, 16, 'atlas', 'wall_top_right');
				this.add.tileSprite(0, 16, 16, 16, 'atlas', 'wall_left');
				this.add.tileSprite(16, 16, 16, 16, 'atlas', 'wall_middle');
				this.add.tileSprite(32, 16, 16, 16, 'atlas', 'wall_right');

				// wall variants
				this.add.tileSprite(0, 32, 16, 16, 'atlas', 'wall_top_left');
				this.add.tileSprite(16, 32, 16, 16, 'atlas', 'wall_top_middle');
				this.add.tileSprite(32, 32, 16, 16, 'atlas', 'wall_top_right');
				this.add.tileSprite(0, 48, 16, 16, 'atlas', 'wall_variant1');
				this.add.tileSprite(16, 48, 16, 16, 'atlas', 'wall_variant2');
				this.add.tileSprite(32, 48, 16, 16, 'atlas', 'wall_variant3');

				// features
				this.add.tileSprite(48, 0, 16, 16, 'atlas', 'feature_top1');
				this.add.tileSprite(64, 0, 16, 16, 'atlas', 'feature_top2');
				this.add.tileSprite(80, 0, 16, 16, 'atlas', 'feature_top3');
				this.add.tileSprite(48, 16, 16, 16, 'atlas', 'feature_lava_mid1');
				this.add.tileSprite(64, 16, 16, 16, 'atlas', 'feature_lava_mid2');
				this.add.tileSprite(80, 16, 16, 16, 'atlas', 'feature_lava_mid3');
				this.add.tileSprite(48, 32, 16, 16, 'atlas', 'feature_lava_base1');
				this.add.tileSprite(64, 32, 16, 16, 'atlas', 'feature_lava_base2');
				this.add.tileSprite(80, 32, 16, 16, 'atlas', 'feature_lava_base3');


				// characters
				const config_dummy = {
					key: 'elf_f_idle',
					frames: this.anims.generateFrameNumbers('tileset_animation', {start: 8, end: 11}),
					frameRate: 8,
					repeat: -1
				};
				this.anims.create(config_dummy);
				this.add.sprite(200, 150, 'elf_f').play('elf_f_idle');

				const config_damsel = {
					key: 'elf_m_idle',
					frames: this.anims.generateFrameNumbers('tileset_animation', {start: 40, end: 43}),
					frameRate: 8,
					repeat: -1
				};
				this.anims.create(config_damsel);
				this.add.sprite(232, 150, 'elf_m').play('elf_m_idle');
			},
			update: function()
			{
				// tick
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
