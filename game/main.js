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
				// initialize
				this.add.tileSprite(0, 16, 16, 16, 'atlas', 'wall');
				this.add.tileSprite(0, 0, 16, 16, 'atlas', 'wall_top');


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
