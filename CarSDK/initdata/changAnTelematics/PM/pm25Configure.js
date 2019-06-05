define([],
	function(){
		var config = {
			levels:{
				level1:{
					minValue:0,
					maxValue:35,
					levelText:"优",
					levelIntroduction:"车内空气清晰，请放心使用",
					backColorNodeStyle:"rgba(29,218,180, 0.9)",
					dataLevelNodeStyle:"#1ddab4"
				},
				level2:{
					minValue:36,
					maxValue:75,
					levelText:"良",
					levelIntroduction:"车内空气良好，请放心使用",
					backColorNodeStyle:"rgba(171,186,86, 0.9)",
					dataLevelNodeStyle:"#abba56"
				},
				level3:{
					minValue:76,
					maxValue:115,
					levelText:"轻度污染",
					levelIntroduction:"车内空气较差，请尽快打开车内空气过滤器",
					backColorNodeStyle:"rgba(247,163,2, 0.9)",
					dataLevelNodeStyle:"#f7a302"
				},
				level4:{
					minValue:116,
					maxValue:150,
					levelText:"中度污染",
					levelIntroduction:"车内空气较差，请尽快打开车内空气过滤器",
					backColorNodeStyle:"rgba(220,87,7, 0.9)",
					dataLevelNodeStyle:"#dc5707"
				},
				level5:{
					minValue:151,
					maxValue:250,
					levelText:"重度污染",
					levelIntroduction:"车内空气很差，请尽快打开车内空气过滤器",
					backColorNodeStyle:"rgba(179,46,4, 0.9)",
					dataLevelNodeStyle:"#dc5707"
				},
				level6:{
					minValue:251,
					maxValue:99999,
					levelText:"严重污染",
					levelIntroduction:"车内空气很差，请尽快打开车内空气过滤器",
					backColorNodeStyle:"rgba(99,30,0, 0.9)",
					dataLevelNodeStyle:"#dc5707"
				}
			},
			getLevel: function(value){
				for (var key in this.levels) {
					if (value >= this.levels[key].minValue && value <= this.levels[key].maxValue) {
						return this.levels[key];
					};
				};
			}
			
		};

		return config
	})