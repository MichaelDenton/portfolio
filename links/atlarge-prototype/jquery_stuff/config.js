$(document).ready(
                function(){
                    	$('ul#portfolio').innerfade({
                        speed: 1000,
                        timeout: 5000,
                        type: 'sequence',
                        containerheight: 	'130px',
                        slide_timer_on: 	'yes',
                        slide_ui_parent: 	'portfolio',
                        slide_ui_text:		'portfolio-desc',
                       	pause_button_id: 	'pause_button',
                       	slide_nav_id:		'slide_nav'
                    	});
                    	$.setOptionsButtonEvent();
                    
                        
                   		$("#pause_button").click(function() {
                   			$.pause();
                        });
                        $("#next_button").click(function() {
                    		$.next();
                        });
                        
                        $("#prev_button").click(function() {
                        	$.prev();
                        });
                        
                    	$("#first_button").click(function() {
                        	$.first();
                        });
                        
                    	$("#last_button").click(function() {
                        	$.last();
                        });
				
			});


