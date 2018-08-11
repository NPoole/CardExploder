$(document).ready(function() 
{
	initCanvas();
	loadDeckJSON("SensationalSeaLife");
});

function initCanvas(){
	
	var canvas = '<canvas id=\"connectome\" height=\"' + $('#workspace').height() + '\" width=\"' + $('#workspace').width() + '\"></canvas>';
	$('#workspace').append(canvas);	
	
}

function loadDeckJSON(title){
	
	var filename = "decks/" + title + ".json";
	console.log('Getting \"' + filename + '\"...');
	
	$.get( filename, function( data ) {
		//success
		console.log('Got File');
		console.log(data);
		deal(data);
	});
	
}


function deal(parsedDeck){
	
	$('.cardPad').each(function(i){
		
		var cardInner = "";
		cardInner += '<div class=\"card\">'
		cardInner += '<div class=\"top node\" id=\"' + i + '-A\">'+ parsedDeck.deck.cards[i].top +'</div>';
		cardInner += '<div class=\"right node\" id=\"' + i + '-B\">'+ parsedDeck.deck.cards[i].right +'</div>';
		cardInner += '<div class=\"bottom node\" id=\"' + i + '-C\">'+ parsedDeck.deck.cards[i].bottom +'</div>';
		cardInner += '<div class=\"left node\" id=\"' + i + '-D\">'+ parsedDeck.deck.cards[i].left +'</div>';
		cardInner += '<div class=\"pushU\"></div>';
		cardInner += '<div class=\"pushR\"></div>';
		cardInner += '<div class=\"pushD\"></div>';
		cardInner += '<div class=\"pushL\"></div>';
		cardInner += '<div class=\"rotate\"></div>';
		cardInner += '</div>';
		$(this).append(cardInner);
		
	});
	
	generateConnectome(parsedDeck);
	
}

function generateConnectome(parsedDeck){
	
	//Get canvas drawing context
	var graphView = document.getElementById('connectome');
	var graphCTX = graphView.getContext('2d');
	
	//Assign abstract identifiers to each node
	
	//Get Array of Symbols
	var symbols = parsedDeck.deck.symbols;
	
	//Get Array of split nomenclature
	var split = parsedDeck.deck.halves;
	
	$('.node').each(function(nodeIndex){
		
		var nodeObj = this;
		
		//Embed the symbol index of each node as data attribute
		$(symbols).each(function(symbolIndex){
			
			if(nodeObj.innerHTML.includes(this)){
				$(nodeObj).data('symbol', symbolIndex);
			}
			
		});

		//Embed the split index of each node as data attribute
		$(split).each(function(splitIndex){
			
			if(nodeObj.innerHTML.includes(this)){
				$(nodeObj).data('split', splitIndex);
			}
			
		});
			
	});
	
	//Draw dots to represent each node
	$('.node').each(function(i){
		
		//Get X and Y Position of each node
		var xpos = Math.round($(this).offset().left)-$('#side-menu').width();
		var ypos = Math.round($(this).offset().top);
		
		//Apply Offsets to make them pretty
		if($(this).hasClass('top')){
			xpos += 20;
			ypos -= 10;
		}else if($(this).hasClass('right')){
			xpos += 18;
			ypos += 40;
		}else if($(this).hasClass('bottom')){
			xpos += 20;
			ypos += 30;
		}else if($(this).hasClass('left')){
			xpos -= 28;
			ypos += 40;
		}
		
		//Store Position Data in the node objects
		$(this).data('xpos', xpos);
		$(this).data('ypos', ypos);
		
		//Draw Circles on each node
		graphCTX.fillStyle = '#FE7ABC';
		graphCTX.beginPath();
		graphCTX.arc($(this).data("xpos"), $(this).data("ypos"),5,0,2 * Math.PI, false);
		graphCTX.fill();
		
	});
	
	//Draw lines to represent relationships
	$('.node').each(function(i){
		
		var matingNode = this;
		
		$('.node').each(function(matchNode){
			
			if($(this).closest('.cardPad').attr('id') != $(matingNode).closest('.cardPad').attr('id')){
		
				if($(this).data('symbol') == $(matingNode).data('symbol') && $(this).data('split') != $(matingNode).data('split')){
					
					console.log("found relationship between " + matingNode.innerHTML + " and " + this.innerHTML);
					
					graphCTX.lineWidth = 1;
					graphCTX.strokeStyle = '#FE7ABC';
					graphCTX.beginPath();
					graphCTX.moveTo($(matingNode).data('xpos'), $(matingNode).data('ypos'));
					graphCTX.lineTo($(this).data('xpos'), $(this).data('ypos'));
					graphCTX.stroke();
					
				}
				
			}
		
		});
		
	});
	
}