var deckInUse;

$(document).ready(function() 
{
	initTools();
	initCanvas();
	loadDeckJSON("SensationalSeaLife");
});

function initTools(){
	$('#drawLines').change(function(){
		generateConnectome(deckInUse);
	});	
	$('#cullDupes').change(function(){
		generateConnectome(deckInUse);
	});		
	$('#deckSelect').change(function(){
		$('.card').remove();
		loadDeckJSON($(this).val());	
	});	
	$('#localDeck').change(function(){
		loadDeckLocal(event);
	});		
}

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

function loadDeckLocal(evt){
	var file = evt.target.files[0];
	var reader = new FileReader();
	reader.onload = (function(e){
		deckInUse = JSON.parse(reader.result);
		$('.card').remove();
		console.log('Got File');
		console.log(deckInUse);
		deal(deckInUse);
	});	
	reader.readAsText(file);
}


function deal(parsedDeck){
	//Create card objects
	$('.cardPad').each(function(i){
		var cardInner = "";
		cardInner += '<div class=\"card\">'
		cardInner += '<div class=\"top node\" id=\"' + i + '-A\">'+ parsedDeck.deck.cards[i].top +'</div>';
		cardInner += '<div class=\"right node\" id=\"' + i + '-B\">'+ parsedDeck.deck.cards[i].right +'</div>';
		cardInner += '<div class=\"bottom node\" id=\"' + i + '-C\">'+ parsedDeck.deck.cards[i].bottom +'</div>';
		cardInner += '<div class=\"left node\" id=\"' + i + '-D\">'+ parsedDeck.deck.cards[i].left +'</div>';
		cardInner += '<div class=\"pushU\"><img src=\"img/arrow-icon-up.png\" height=\"20px\" width=\"20px\"></div>';
		cardInner += '<div class=\"pushR\"><img src=\"img/arrow-icon-rt.png\" height=\"20px\" width=\"20px\"></div>';
		cardInner += '<div class=\"pushD\"><img src=\"img/arrow-icon-dn.png\" height=\"20px\" width=\"20px\"></div>';
		cardInner += '<div class=\"pushL\"><img src=\"img/arrow-icon-lf.png\" height=\"20px\" width=\"20px\"></div>';
		cardInner += '<div class=\"rotate\"><img src=\"img/rotate-icon.png\" height=\"20px\" width=\"20px\"></div>';
		cardInner += '</div>';
		$(this).append(cardInner);
	});
	//Assign Unique IDs to nodes
	$('.node').each(function(i){
		$(this).data('node-id',UID());
	});
	//Save Deck object in global
	deckInUse = parsedDeck;
	//More setup
	navPlumbing();
	generateConnectome(parsedDeck);
}

function navPlumbing(){
	$('.pushU').click(function(event){swapUp(event.target);});
	$('.pushR').click(function(event){swapRight(event.target);});
	$('.pushD').click(function(event){swapDown(event.target);});
	$('.pushL').click(function(event){swapLeft(event.target);});
	$('.rotate').click(function(event){rotateCard(event.target);});
}

function generateConnectome(parsedDeck){
	//Get canvas drawing context
	var graphView = document.getElementById('connectome');
	var graphCTX = graphView.getContext('2d');
	//Erase previous connectome
	graphCTX.clearRect(0, 0, graphView.width, graphView.height);
	$('#relationshipTable').html('');
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
					console.log(); //40-700					
					var lineLength = lengthOfLine($(matingNode).data('xpos'), $(matingNode).data('ypos'), $(this).data('xpos'), $(this).data('ypos'));
					// While we're here, let's mark the dots that have connecting lines <42px
					// This means that they are in a "solved" position
						if(lineLength < 42){
							graphCTX.fillStyle = '#bfffe8';
							graphCTX.beginPath();
							graphCTX.arc($(this).data("xpos"), $(this).data("ypos"),5,0,2 * Math.PI, false);
							graphCTX.fill();
							graphCTX.beginPath();
							graphCTX.arc($(matingNode).data('xpos'), $(matingNode).data('ypos'),5,0,2 * Math.PI, false);
							graphCTX.fill();
						}
						var lineHue = Math.round(scale(lineLength, 40, 700, 150, 315));
						// Assign procedural name to relationship and add to list
						var connectID = "{" + $(matingNode).data('node-id') + "-" + $(this).data("node-id") + "}";
						if(lineLength < 42){
							connectID += " ★";
						}
						var thisEntry = $('#relationshipTable').append('<p data-r-length=\"' + Math.round(lineLength) + '\" style=\"background-color: ' + 'hsla(' + lineHue + ', 100%, 85%, 0.8)\">' + connectID + "</p>");
						// Draw the relationship lines
					if($('#drawLines').prop("checked")){
						graphCTX.lineWidth = 1;
						graphCTX.strokeStyle = 'hsla('+lineHue+', 100%, 85%, 0.8)';
						graphCTX.beginPath();
						graphCTX.moveTo($(matingNode).data('xpos'), $(matingNode).data('ypos'));
						graphCTX.lineTo($(this).data('xpos'), $(this).data('ypos'));
						graphCTX.stroke();
					}
				}
			}
		});
	});
	if($('#cullDupes').prop("checked")){
		cullDuplicateRelationships();
	};
	runStats();
}

function swapUp(target){
	var cardPos = $(target).closest('.cardPad').attr('id');
	if(cardPos!=1 && cardPos!=2 && cardPos!=3){
		var swapSelect = ".cardPad#" + (parseInt(cardPos) - 3);
		swapCards($(target).closest('.card'), $(swapSelect).find('.card'));
	}
	generateConnectome(deckInUse);
}

function swapRight(target){
	var cardPos = $(target).closest('.cardPad').attr('id');
	if(cardPos!=3 && cardPos!=6 && cardPos!=9){
		var swapSelect = ".cardPad#" + (parseInt(cardPos) + 1);
		swapCards($(target).closest('.card'), $(swapSelect).find('.card'));
	}	
	generateConnectome(deckInUse);
}

function swapDown(target){
	var cardPos = $(target).closest('.cardPad').attr('id');
	if(cardPos!=7 && cardPos!=8 && cardPos!=9){
		var swapSelect = ".cardPad#" + (parseInt(cardPos) + 3);
		swapCards($(target).closest('.card'), $(swapSelect).find('.card'));
	}
	generateConnectome(deckInUse);
}

function swapLeft(target){
	var cardPos = $(target).closest('.cardPad').attr('id');
	if(cardPos!=1 && cardPos!=4 && cardPos!=7){
		var swapSelect = ".cardPad#" + (parseInt(cardPos) - 1);
		swapCards($(target).closest('.card'), $(swapSelect).find('.card'));
	}
	generateConnectome(deckInUse);
}

function rotateCard(target){
	$(target).closest('.card').find('.top').removeClass('top').addClass('move');
	$(target).closest('.card').find('.left').removeClass('left').addClass('top');
	$(target).closest('.card').find('.bottom').removeClass('bottom').addClass('left');
	$(target).closest('.card').find('.right').removeClass('right').addClass('bottom');
	$(target).closest('.card').find('.move').removeClass('move').addClass('right');
	generateConnectome(deckInUse);
}

function swapCards(cardA, cardB){
	var originA = cardA.closest('.cardPad');
	var originB = cardB.closest('.cardPad');
	cardA.appendTo(originB);
	cardB.appendTo(originA);
}

function lengthOfLine(x1, y1, x2, y2){
	var a = x1 - x2;
	var b = y1 - y2;
	return Math.sqrt( a*a + b*b );	
}

function scale(input, yMin, yMax, xMin, xMax){
percent = (input - yMin) / (yMax - yMin);
return (percent * (xMax - xMin) + xMin);
}

function UID(){
  return Math.random().toString(36).substr(2, 16);
};

function cullDuplicateRelationships(){
	$('#relationshipTable').find('p').each(function(){
		var testObj = this;
		var descriptor = $(this).text();
		var inverse = "{" + descriptor.split("-")[1].split("}")[0] + "-" + descriptor.split("-")[0].split("{")[1] + "}";
		var inverseAlt = inverse + " ★";
		$('#relationshipTable').find('p').each(function(){
			if($(this).text() == inverse || $(this).text() == inverseAlt){
				$(testObj).remove();
			}
		});
	});	
}

function runStats(){
	var connections = $('#relationshipTable').find('p').length;
	var combinedLength = 0;
	$('#relationshipTable').find('p').each(function(){
		combinedLength += parseInt($(this).attr('data-r-length'));
	});
	var avgLength = Math.round(combinedLength / connections);
	var outString = "";
	outString += "# of Connections:\n";
	outString += connections + "\n\n";
	outString += "Combined Length of Connections:\n";
	outString += combinedLength + "\n\n";
	outString += "Avg Length of Connections:\n";
	outString += avgLength + "\n\n";
	$('#stats').val(outString);
}