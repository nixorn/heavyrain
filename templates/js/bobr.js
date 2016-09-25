// var bobr1 = new bobr('143jf',$('#container'));
// bobr1.beaver_run(400,3); //400 - координата x фигуры, 3 - id фигуры
//Создание бобра

function bobr(id,$svg_wrappper) {
	var that = this,
			$bobr,
			stop = false,
			position = {
				'jump_in': false,
				'run' : false,
				'eat' : false,
				'run_out' :false,
				'jump_out': false
			};

	this.init = function() {
		$svg_wrappper.css('position','relative').append('<div class="animal" id="'+id+'"></div>');
		$bobr = $('#'+id);
		$bobr.click(function(){
			$bobr.css({
				'-webkit-transform':'translateX(3000%)',
				'transform':'translateX(3000%)',
				'-webkit-transition':'-webkit-transform 600ms linear',
				'transition':'-webkit-transform 300ms linear',
				'transition':'transform 600ms linear, -webkit-transform 600ms linear',
				'will-change':'transform',
			});
			setTimeout(function(){
				$bobr.remove();
			}, 600);
			stop = true;
		});
	}

	this.jump_in = function(side,cords,id_figure,ini_time) {
		var jump = [
			{
				"style": {
					'-webkit-transform':'translateY(-40%)',
					'transform': 'translateY(-40%)',
					'will-change':'transform',
					'-webkit-transition':'-webkit-transform 150ms linear',
					'transition':'-webkit-transform 150ms linear',
					'transition':'transform 150ms linear',
					'transition':'transform 150ms linear, -webkit-transform 150ms linear'
				},
				"time": 150,
				"jump_start": ""
			},
			{
				"style": {
					'-webkit-transform':'translateX(20%)',
					'transform': 'translateX(20%)',
					'will-change':'transform',
					'-webkit-transition':'-webkit-transform 150ms linear',
					'transition':'-webkit-transform 150ms linear',
					'transition':'transform 150ms linear',
					'transition':'transform 150ms linear, -webkit-transform 150ms linear'
				},
				"time": 150
			},
			{
				"style": {
					'-webkit-transform':'translateX(40%)',
					'transform': 'translateX(40%)',
					'will-change':'transform',
					'-webkit-transition':'-webkit-transform 150ms linear',
					'transition':'-webkit-transform 150ms linear',
					'transition':'transform 150ms linear',
					'transition':'transform 150ms linear, -webkit-transform 150ms linear'
				},
				"time": 150,
				"jump_end": ""
			},
		].reverse();
		position['jump_in'] = true;
		this.update_anims(ini_time,jump,id_figure,side,cords);
	}

	this.jump_out = function(side,cords,id_figure,ini_time) {
		var jump = [
			{
				"style": {
					'-webkit-transform':'translateY(-40%)',
					'transform': 'translateY(-40%)',
					'will-change':'transform',
					'-webkit-transition':'-webkit-transform 150ms linear',
					'transition':'-webkit-transform 150ms linear',
					'transition':'transform 150ms linear',
					'transition':'transform 150ms linear, -webkit-transform 150ms linear'
				},
				"time": 150,
				"jump_start": "",
				"reverse": ""
			},
			{
				"style": {
					'-webkit-transform':'translateX(-150%)',
					'transform': 'translateX(-150%)',
					'will-change':'transform',
					'-webkit-transition':'-webkit-transform 150ms linear',
					'transition':'-webkit-transform 150ms linear',
					'transition':'transform 150ms linear',
					'transition':'transform 150ms linear, -webkit-transform 150ms linear'
				},
				"time": 150,
				"jump_end": "",
				"reverse": ""
			}
		].reverse();
		position['jump_out'] = true;
		this.update_anims(ini_time,jump,id_figure,side,cords);
	}

	this.eat = function(side,cords,id_figure,ini_time) {
		var cordVal = cords+'px';
		var anims = [
			{
				"style": {
					'-webkit-transition': 'ease 1000ms all',
					'transition': 'ease 1000ms all',
					'-webkit-transform':'translateX('+cordVal+')',
					'transform':'translateX('+cordVal+')',
					'will-change':'transform'
				},
				"time": 1000,
				"background": ""
			},
			{
				"style": {
					'-webkit-transition': 'ease 1000ms all',
					'transition': 'ease 1000ms all',
					'-webkit-transform':'translateX('+cordVal+')',
					'transform':'translateX('+cordVal+')',
					'will-change':'transform'
				},
				"time": 1000,
				"background": ""
			}
		].reverse();
		position['eat'] = true;
		this.update_anims(ini_time,anims,id_figure,side,cords);
	}

	this.run = function(side,cords,id_figure,ini_time)  {
		var cordVal = cords+'px';
		var anims = [
			{
				"style": {
					'-webkit-transform':'translateX('+cordVal+')',
					'transform': 'translateX('+cordVal+')',
					'will-change':'transform',
					'-webkit-transition':'-webkit-transform 1000ms linear',
					'transition':'-webkit-transform 1000ms linear',
					'transition':'transform 1000ms linear',
					'transition':'transform 1000ms linear, -webkit-transform 1000ms linear'
				},
				"time": 1000
			}
		];
		position['run'] = true;
		this.update_anims(ini_time,anims,id_figure,side,cords);
	}
	this.run_out = function(side,cords,id_figure,ini_time)  {
		var cordVal = cords+'px';
		var anims = [
			{
				"style": {
					'-webkit-transform':'translateX(40px)',
					'transform': 'translateX(40px)',
					'will-change':'transform',
					'-webkit-transition':'-webkit-transform 1000ms linear',
					'transition':'-webkit-transform 1000ms linear',
					'transition':'transform 1000ms linear',
					'transition':'transform 1000ms linear, -webkit-transform 1000ms linear'
				},
				"time": 1000,
				"reverse": ""
			}
		];
		position['run_out'] = true;
		this.update_anims(ini_time,anims,id_figure,side,cords);
	}

	this.beaver_run = function(cords,id_figure,side) {
		$bobr.removeClass('reverse');
		ini_time = 2000;
		this.jump_in(side,cords,id_figure,ini_time);
	}

	this.update_anims = function(ini_time,anims,id_figure,side,cords) {
			var current_anim = anims.pop();
			if (current_anim) {
				setTimeout(function(){
					$bobr.css(current_anim.style);
						if ("background" in current_anim) {
							$bobr.addClass('background-eat');
						}
						if ("reverse" in current_anim) {
							$bobr.removeClass('background-eat').addClass('reverse');
						};
						if ("jump_start" in current_anim) {
							$bobr.addClass('jump');
						};
						if ("jump_end" in current_anim) {
							$bobr.removeClass('jump');
						};
					ini_time = current_anim.time;
					if (!stop) {
						that.update_anims(ini_time,anims,id_figure,side,cords);
					}
				}, ini_time);
			} else {
				switch (this.position()) {
					case'run':
						that.run(side,cords,id_figure,ini_time);
						break;
					case 'eat':
						if (eatFigure(cords, id_figure)) {
							that.eat(side,cords,id_figure,ini_time);
							break;
						} else {
							position['eat'] = true;
							this.update_anims(ini_time,anims,id_figure,side,cords);
						}
					case 'run_out':
						that.run_out(side,cords,id_figure,ini_time);
						break;
					case 'jump_out':
						that.jump_out(side,cords,id_figure,ini_time);
						break;
				}

			}
	}

	this.position = function() {
		var pos = '';
		$.each(position, function(index, value) {
	   	if (!value) {
	   		pos = index;
	   		return false;
	  	}
	  });
	  return pos;
	}

	this.init();
}
