/*
	
	jQuery Minesweeper 0.1
	
	Mathew Byrne (mathewbyrne@gmail.com)
	http://www.matbyrne.com/
	
	The MIT License
	
	Copyright (c) 2008 Mathew Byrne
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	
*/

(function ($) {

function _generateBombs (rows, cols, count) {
	var randInt = function (max) {
		return Math.floor(Math.random() * max);
	};
	var coords = [], key;
	for (var i = 0; i < count; i++) {
		do {
			key = [randInt(rows), randInt(cols)].join(',');
		} while ($.inArray(key, coords) >= 0);
		coords.push(key);
	}
	return coords;
}
	
function _bombCount (row, col, rows, cols, coords) {
	var count = 0;
	var minRow = Math.max(0, row - 1), maxRow = Math.min(rows - 1, row + 1);
	var minCol = Math.max(0, col - 1), maxCol = Math.min(cols - 1, col + 1);
	for (var i = minRow; i <= maxRow; i++) {
		for (var j = minCol; j <= maxCol; j++) {
			if (i == row && j == col) continue; // Skip the middle
			if ($.inArray([i, j].join(','), coords) >= 0) {
				count++;
			}
		}
	}
	return count;
}

this.Minesweeper = function (element, options) {

	var that  = {}, left,
		vars  = Minesweeper.vars,
		rows  = options.rows,
		cols  = options.cols,
		bombs = options.bombs,
		map   = [],
		board = $('<div />')
			.addClass(vars.BOARD_CLASS)
			.appendTo(element);
	
	// Recursive function, probably need to find a better way since many
	// browsers will crap out at fairly small recursion levels.
	var _floodFill = function (row, col) {
		if (row < 0 || row > rows - 1 ||
			col < 0 || col > cols - 1 ||
			map[row][col].hasClass(vars.VISIBLE_CLASS)) {
			return;
		}
		
		map[row][col].addClass(vars.VISIBLE_CLASS);
		left--;

		if (left == bombs) {
			board.find('.' + vars.BOMB_CLASS).addClass(vars.FLAG_CLASS);
			that.stop();
		}

		if (!map[row][col].hasClass(vars.NUMBER_CLASSES[0])) {
			return this;
		}

		for (var i = row - 1; i <= row + 1; i++) {
			for (var j = col - 1; j <= col + 1; j++) {
				if (i == row && j == col) continue;
				_floodFill(i, j);
			}
		}
	};

	var _triggerBomb = function () {
		board.find('.' + vars.BOMB_CLASS).addClass(vars.VISIBLE_CLASS);
		that.stop();
	};
	
	if (bombs > left) {
		bombs = remaining;
	}
	
	for (var row = 0; row < rows; row++) {
		map[row] = [];
		var div  = $('<div />')
			.addClass(vars.ROW_CLASS)
			.appendTo(board);
		
		for (var col = 0; col < cols; col++) {
			map[row][col] = $('<div />')
				.addClass(vars.CELL_CLASS)
				.appendTo(div);
		}
	}
	
	// Bind board event handlers.
	board
		.bind('click', function (e) {
			e.preventDefault();
			if (that.isPlaying()) {
				var target = $(e.target);
				if (target.isInvisibleCell()) {
					//&& !target.hasClass(vars.FLAG_CLASS)) {
					var row = target.parent().prevAll().size();
					var col = target.prevAll().size();
					var fn  = target.isBomb() ? _triggerBomb : _floodFill;
					fn(row, col);
				}	
			}
			$(element).trigger('gameinput');
		})
		.bind('contextmenu', function (e) {
			e.preventDefault();
			if (that.isPlaying()) {
				var target = $(e.target);
				if (target.isInvisibleCell()) {
					target.toggleClass(vars.FLAG_CLASS);
				}
			}
			$(element).trigger('gameinput');
		});
	
	$.extend(that, {
		
		reset: function () {
			
			var coords = _generateBombs(rows, cols, bombs), cell, that = this;
			
			board
				.find('.' + vars.CELL_CLASS)
					.attr('class', vars.CELL_CLASS);
			
			for (var row = 0; row < rows; row++) {
				for (var col = 0; col < cols; col++) {
					cell = map[row][col];
					if ($.inArray([row, col].join(','), coords) >= 0) {
						cell.addClass(vars.BOMB_CLASS);
					} else {
						var count = _bombCount(row, col, rows, cols, coords);
						cell.addClass(vars.NUMBER_CLASSES[count]);
						cell.text(count > 0 ? count : '');
					}
				}
			}
			
			left = rows * cols;
			
			return this;
		},
		
		play: function () {
			board.addClass(vars.PLAYING_CLASS);
			return this;
		},
		
		stop: function () {
			board.removeClass(vars.PLAYING_CLASS);
			return this;
		},
		
		isPlaying: function () {
			return board.hasClass(vars.PLAYING_CLASS);
		},
		
		bombsRemaining: function () {
			console.log(bombs, board.find('.' + vars.FLAG_CLASS).size());
			return (bombs - board.find('.' + vars.FLAG_CLASS).size());
		},
		
		actualBombsRemaining: function () {
			return (bombs - board.find('.' + vars.BOMB_CLASS
				+ '.' + vars.FLAG_CLASS).size());
		}
		
	});
	
	return that.reset().play();
};

Minesweeper.vars = {
	BOARD_CLASS: 'board',
	ROW_CLASS: 'row',
	CELL_CLASS: 'cell',
	BOMB_CLASS: 'bomb',
	VISIBLE_CLASS: 'visible',
	FLAG_CLASS: 'flag',
	PLAYING_CLASS: 'playing',
	NUMBER_CLASSES: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']
};

$.fn.extend({
	
	isBomb: function () {
		return this.hasClass(Minesweeper.vars.BOMB_CLASS);;
	},
	
	isInvisibleCell: function () {
		return this.hasClass(Minesweeper.vars.CELL_CLASS)
			&& !this.hasClass(Minesweeper.vars.VISIBLE_CLASS);
	},
	
	minesweeper: function (options, getInstance) {
		options = $.extend({}, $.fn.minesweeper.options, options);
		var ms = new Minesweeper (this[0], options);
		return getInstance ? ms : this;
	}
	
});

})(jQuery);
