/** 上下翻转 */
function Flipper (selector) {

	this.config = {
		// 数据更新间隔
		INTERVAL: 1000,
		// 每位数之间的延迟间隔
		DELAY: 0.03,
		// 半次动画时间（一个完整动画由两部分组成）
		DURATION: 0.6/2,

		// 能支持的最大位数 @优化todo：不限制位数,动态插入HTML
		max: 12
	}

	this.value = 654321;

	this.$root = $(selector);

	this.init();

}

Flipper.prototype = {
	init: function() {
		var c = this.config;

		var htmls = '';

		for (var i = 0; i < c.max; i++) {
			htmls = htmls + [	
				'<li class="digit d'+i+'">',
        			'<span class="number first now"></span>',
        			'<span class="number second old"></span>',
      			'</li>'
      		].join(' ');
		}

		this.$root.append(htmls);

		this.load();	
	},
	load: function(){
		var me = this;

		setInterval(function(){
			// 随机数
			me.value = me.value + Math.floor((Math.random()*50000));

			me.setValue(me.value);
		}, this.config.INTERVAL);
	},
	setValue: function(val){
		var c = this.config;

		this.reset();

		var digits = String(val).split('');

		var $digit;
		var index = 0;

		for (var i = digits.length - 1; i >= 0; i--) {

			$digit = $('.d'+index);
			index++;

			if($digit.is(":hidden")){
				$digit.show();
			}

			$digit.find('.old')
				.addClass('turn-out')
				.css('animation-delay', (c.DELAY*index)+'s');

			$digit.find('.now')
					.html(digits[i])
					.addClass('turn-in')
					.css('animation-delay', (c.DELAY*index+c.DURATION)+'s');

		};
	},
	// 重置
	reset: function(){
		$('.theFlipper .number').removeClass('turn-in turn-out');
		$('.theFlipper .first').toggleClass('old').toggleClass('now');
		$('.theFlipper .second').toggleClass('old').toggleClass('now');
	},
	clear: function(){
		$('.theFlipper .digit').hide();
		this.setValue(0);
	}
};