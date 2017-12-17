jQuery(document).ready(function($){
	

    //
	// //IE9 placeholder fallback
	// //credits http://www.hagenburger.net/BLOG/HTML5-Input-Placeholder-Fix-With-jQuery.html
	// if(!Modernizr.input.placeholder){
	// 	$('[placeholder]').focus(function() {
	// 		var input = $(this);
	// 		if (input.val() == input.attr('placeholder')) {
	// 			input.val('');
	// 	  	}
	// 	}).blur(function() {
	// 	 	var input = $(this);
	// 	  	if (input.val() == '' || input.val() == input.attr('placeholder')) {
	// 			input.val(input.attr('placeholder'));
	// 	  	}
	// 	}).blur();
	// 	$('[placeholder]').parents('form').submit(function() {
	// 	  	$(this).find('[placeholder]').each(function() {
	// 			var input = $(this);
	// 			if (input.val() == input.attr('placeholder')) {
	// 		 		input.val('');
	// 			}
	// 	  	})
	// 	});
	// }

});


// //credits http://css-tricks.com/snippets/jquery/move-cursor-to-end-of-textarea-or-input/
// jQuery.fn.putCursorAtEnd = function() {
// 	return this.each(function() {
//     	// If this function exists...
//     	if (this.setSelectionRange) {
//       		// ... then use it (Doesn't work in IE)
//       		// Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
//       		var len = $(this).val().length * 2;
//       		this.focus();
//       		this.setSelectionRange(len, len);
//     	} else {
//     		// ... otherwise replace the contents with itself
//     		// (Doesn't work in Google Chrome)
//       		$(this).val($(this).val());
//     	}
// 	});
// };