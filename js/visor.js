var pdfContainer;
var inputPage;
var selectionsContainer;
var pdfDocument;
var filePath;
var currentScale;
var zoomStep;
var selectionCounter;
var selections;
var currentColor;
var currentOpacity;

(function( $ ) {
 
	/**
	 * @description Function to create toolbar buttons
	 * @param labelName: Label
	 * @param iconName: Icon
	 */
	$.fn.createToolBarButton = function(labelName, iconName ) {
		
		return this.button({
			classes: {
				"ui-button": "highlight"
			},
			label: labelName,
			showLabel: false,
			icon: iconName
		});

	};

}(jQuery));

/**
  * @description Main Function
*/
$(document)
	.ready(function() {
		setUp();
		
		loadTask().promise.then(
				function(pdfDocument_) {
					loadFirstPage(pdfDocument_)
				});

		loadToolbar();

		loadRightSlider();
		
	});

/**
* @description Sets up global variables
*/
function setUp()
{

	pdfContainer = $("#pageContainer");
	inputPage = $("#inputPage");
  	currentScale = 1;
  	zoomStep = 0.1;
  	selectionCounter = 0;
	selections = [];
	var bodyStyles = window.getComputedStyle(document.body);
	currentColor= bodyStyles.getPropertyValue("--main-bg-color");
	currentOpacity = bodyStyles.getPropertyValue("--main-opacity");

	filePath = "./examen.pdf";
  
}

/**
 * @description Loads PDF the file
 */
function loadTask()
{

  return pdfjsLib.getDocument({
    url: filePath
	});
	
}

/**
 * Loads pdfDocument's first page
 * @param pdfDocument_: pdfDocument object 
 */
function loadFirstPage(pdfDocument_)
{

	pdfDocument = pdfDocument_;
	inputPage.spinner( "option", "max", pdfDocument.numPages);
	
	return loadPage();

}

function toggleSpinner(newValue)
{
	$(" .ui-spinner a.ui-spinner-button").css("display",newValue);
}

/**
 * Loads the specified page
 * @param {integer} pageNum 
 */
function loadPage()
{
	var pageNum = parseInt(inputPage.val());

	pdfContainer.find(".selection").remove();

	toggleSpinner("none");

	return pdfDocument.getPage(pageNum).then(function (pdfPage) {
		
    var viewport = pdfPage.getViewport({scale: currentScale});

		var canvas = $("#mycanvas")[0];
		var context = canvas.getContext("2d");
		canvas.height= viewport.height; 
		canvas.width= viewport.width; 
		
		var renderContext = {
      canvasContext: context,
      viewport: viewport
    };

		return pdfPage.render(renderContext).promise.then(function() {
			return pdfPage.getTextContent();
	}).then(function(textContent) {
			 
			var pdfCanvas = $("#mycanvas"); 
			var canvasOffset = pdfCanvas.offset();
	
			$("#textlayer").empty()
										 .css({ left: canvasOffset.left + "px", 
														top: canvasOffset.top + "px", 
														height: pdfCanvas.get(0).height + "px", 
														width: pdfCanvas.get(0).width + "px" });
	
			pdfjsLib.renderTextLayer({
					textContent: textContent,
					container: $("#textlayer").get(0),
					viewport: viewport
			});

	});
		

	}).then(function(){
			pdfContainer.css("width", pdfContainer.find(">:first-child").innerWidth());
			if (selections!=[])
			{
				drawSelectionsInPage();
			}
			toggleSpinner("block");
		});
	
}

function searchPage(doc, pageNumber, textToFind) {
  return doc.getPage(pageNumber).then(function (page) {
    return page.getTextContent();
  }).then(function (content) {
    // Search combined text content using regular expression
    var text = content.items.map(function (i) { return i.str; }).join('');
    var re = new RegExp("(.{0,20})" + textToFind + "(.{0,20})", "gi"), m;
    var lines = [];
    while (m = re.exec(text)) {
      var line = (m[1] ? "..." : "") + m[0] + (m[2] ? "..." : "");
      lines.push(line);
    }
    return {page: pageNumber, items: lines};
  });
}


/**
 * @description Draws the selections belonging to the
 * current page
 */
function drawSelectionsInPage() {

	$.each(selections, function(index, value) {
		if (value.page == inputPage.val()) {
			pdfContainer.append(drawSelection(value));
		} 
	});

}

/**
 * @description Saves selections from page in the array
 * of selections
 */
function saveSelectionsFromPage() {
	$("#pageContainer div.selection")
		.each(function(i) {
			var myObject = new Object();
			myObject.page = this.id.substring(this.id.indexOf("-") + 1);
			myObject.posIni = $(this)
				.position();
			myObject.id = this.id;
			myObject.title = $(this)
				.find(".topBar")
				.contents()
				.filter(function() {
					return this.nodeType == Node.TEXT_NODE;
				})
				.text();
			myObject.posFin = {
				"left": myObject.posIni.left + $(this)
					.width(),
				"top": myObject.posIni.top + $(this)
					.height()
			};
			myObject.backgroundColor = $(this).css("background-color");
			myObject.opacity = $(this).css("opacity");
			myObject.comments = $(this).find("textArea:first").val(); 
			selections.push(myObject);
		});
}

/**
 * @description Loads toolbar
 */
function loadToolbar() 
{  

	$("#toolbar").draggable();

	$("#addIcon")
		.createToolBarButton("New Selection", "ui-icon-plus")
		.click(function() {
			addSelection();
	});
	
	createSpinnerPageNumber();
	
	$("#loadIcon")
	.createToolBarButton("Load selections", "ui-icon-script")
	.click(function() {
		selections = JSON.parse(localStorage.getItem("selections"));
		drawSelectionsInPage();
	});

	$("#saveIcon")
	.createToolBarButton("Save selections", "ui-icon-disk")
	.click(function() {
		saveSelectionsFromPage();
		localStorage.setItem("selections", JSON.stringify(selections));
	});

	$("#zoomInIcon")
	.createToolBarButton("Zoom in", "ui-icon-zoomin")
	.click(function() {
		zoomIn();
		console.log(searchPage(pdfDocument, 1, "Trace"));
	});
	
	$("#zoomOutIcon")
	.createToolBarButton("Zoom out", "ui-icon-zoomout")
	.click(function() {
		zoomOut();
	});

	$("#showRubric")
	.createToolBarButton("Show/Hide rubric", "ui-icon-suitcase")
	.click(function() {
		$("#slider").slideReveal("toggle");
	});
		
}

/* Loads the right slider panel */
function loadRightSlider()
{

	$("#slider").slideReveal({
		trigger: $("#rubricPanelHandle"),
		position: "right",
		width: "50%",
		push: false
	}).append(
		JSON.parse(localStorage.getItem("rubric")));

}

/**
 * @description Creates the spinner control
 */
function createSpinnerPageNumber()
{

  $("#inputPage")
    .spinner({
    classes: {
      "ui-button": "highlight"
    },
    label: "Page Number",
    showLabel: false,
    min: 1
	})
	.val(1)
  .on("input", function(e){
		
		//var v = parseInt($(this).val());

		if (!$.isNumeric($(this).val()))
		{
			$(this).val($(this).spinner( "option", "min" ));
		}
	}
	)
	.on("spinstop", function(e, ui){
		if ($(this).val() != ""){
			loadPage(parseInt(this.value));
		}});

}

/**
 * @description Zooms in
 */
function zoomIn(){
	
	currentScale = currentScale + zoomStep; 
	loadPage();
	
}

/**
* @description Zooms out
*/
function zoomOut(){

currentScale = currentScale - zoomStep;
if (currentScale<zoomStep)
{
	currentScale = zoomStep;
}
loadPage();

}

/** 
 * @description Add a new div as a Selection
 */
function addSelection() 
{

  var newId = "selection" + selectionCounter + "-" + inputPage.val();

  selectionCounter++;
	
	pdfContainer
		.append(drawSelection({
			"id": newId,
			"title": "Selection " + inputPage.val() + " - " + selectionCounter,
			"backgroundColor": currentColor,
			"opacity": currentOpacity,
			"page": inputPage.val(),
			"posIni": {
				"left": pdfContainer.position().left,
				"top": pdfContainer.position().top
			},
			"posFin": {
				"left": pdfContainer.position().left + 200,
				"top":  pdfContainer.position().top + 100
			},
			"comments":""
		}));

}

/** 
 * @description Create a div as a Selection
 * @param value: JSON object with all the information required
 */
function drawSelection(value) {
	var newDiv = $("<div>");
	return newDiv
		.draggable({
			containment: pdfContainer
		})
		.resizable({
			containment: pdfContainer,
			handles: "all"
		})
		.addClass("selection")
		.attr("id", value.id)
		.css({
			"position": "absolute",
			"left": (value.posIni.left) * currentScale,
			"top": (value.posIni.top) * currentScale,
			"width": (value.posFin.left - value.posIni.left) * currentScale,
			"height": (value.posFin.top - value.posIni.top) * currentScale,
			"opacity": value.opacity,
			"background-color": value.backgroundColor,
			"opacity": value.opacity,
			"z-index": 2
		})
		.append(createButtonsBar())
		.append($("<textarea>").addClass("textAreaSelection").draggable({
			containment: newDiv
		}).val(value.comments));
}

function createButtonsBar()
{
	var newDiv = $("<div>");
	return newDiv
		.append($("<button>")
			.createToolBarButton("Select Color", "ui-icon-transfer-e-w")
			.click(
				function()
				{
					this.append($("<div>")
							.append($("<label>").attr("for", "colorPicker").text("Select a color"))
							.append($("<input>")
								.attr("id", "colorPicker")
								.attr("type", "color")
								.val(currentColor)
								.on("input", function(e){
									newDiv.parent().css("background-color", $(this).val());
									currentColor = $(this).val();
								}))
							.append(createSlider(newDiv.parent()))
					.dialog({
						closeOnEscape: true,
						modal:true
					}));
				}
			)
		);
}


/**
 * @description Creates a slider
 */
function createSlider(value){

	return $("<div>")
	.slider({
		max: 1,
		min: 0.30,
		step: 0.01,
		value: currentOpacity,
		slide: function(event, ui) {
			currentOpacity = ui.value;
			value
				.css({
				opacity: ui.value
			})
		}
});
}
