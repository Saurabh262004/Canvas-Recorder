// example use

let canvas = document.createElement('canvas'),
ctx = canvas.getContext('2d'),
cir = 10;

canvas.setAttribute('height', '1080');
canvas.setAttribute('width', '1920');
canvas.setAttribute('id', 'myCanvas');
canvas.setAttribute('style', 'border:1px solid #000;');

document.getElementsByTagName('body')[0].appendChild(canvas);

let recorder = new Recorder('myCanvas');

const draw = () => {
	ctx.beginPath();
	ctx.fillStyle = '#66ff44';
	ctx.arc(0, 0, cir, 0, Math.PI * 2);
	ctx.fill();
	cir *= 1.1;
}

const cb = () => {
	console.log('call back');
}

recorder.record(draw, 100, true, 'Rec-1', cb);
