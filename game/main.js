const WIDTH_CANVAS = 800;
const HEIGHT_CANVAS = 600;


document.addEventListener("DOMContentLoaded", function()
{
	const dom_container = document.getElementById("container");

	const game = new Phaser.Game({
		type: Phaser.AUTO,
		title: "GMTK 2020",
		parent: dom_container,
		width: WIDTH_CANVAS,
		height: HEIGHT_CANVAS,
		physics: {
			default: "arcade",
			arcade: {
				gravity: {y: 200}
			}
		},
		scene: {
			preload: function()
			{
				// load assets
			},
			create: function()
			{
				// initialize
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

	window.addEventListener("resize", resize);
	resize();
});
