var pdfContainer;
var inputPage;
var pdfDocument;
var filePath;
var currentScale;
var zoomStep;
var selectionCounter;
var selections;
var currentColor;
var currentOpacity;
var selectedSelection;
var scrollPosition;

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

	/** 
	* @description Create a div as a Selection
	* @param value: JSON object with all the information required
	*/

	$.fn.drawSelection = function (value) {
	   selectionCounter++;
	   var newDiv = $("<div>");
	   var initialState = (value.windowLocked=="on");
	   newDiv
		   .draggable({
			   containment: pdfContainer,
			   disabled: initialState
		   })
		   .resizable({
			   containment: pdfContainer,
			   disabled: initialState,
			   minWidth: "350",
			   handles: "all"
		   })
		   .data("checks", value.checks)
		   .data("windowLocked", value.windowLocked)
		   .data("qualification", value.qualification)
		   .data("backgroundColor", value.backgroundColor)
		   .addClass("selection")
		   .attr("id", value.id)
		   .css({
			   "position": "relative",
			   "left": (value.posIni.left) * currentScale,
			   "top": scrollPosition + (value.posIni.top * currentScale),
			   "width": value.width * currentScale,
			   "height": value.height * currentScale,
			   "opacity": value.opacity,
			   "background-color": value.backgroundColor,
			   "opacity": value.opacity,
			   "z-index": 2
		   })
		   .click(function()
			   {
				   selectedSelection = $(this).attr("id");
				   $("#slider").find("input[type=checkbox]").prop("checked",false);
				   $.each($(this).data("checks"), function(index, value) {
					   $("#" + value).prop("checked", true);
				   });
		   })
		   .append(createButtonsBar(value))
		   .append($("<textarea>").addClass("textAreaSelection").draggable({
			   containment: newDiv
		   }).val(value.comments));

		   this.append(newDiv);

		   newDiv.find(".spinnerQualification").spinner
			({
				classes: {
				  "ui-button": "highlight"
				},
				label: "Nota",
				showLabel: true,
				min: 1,
				max: value.qualification
				})
				.val(value.qualification)
				  .on("input", function(e){
					
					if (!$.isNumeric($(this).val()))
					{
						$(this).val($(this).spinner( "option", "min" ));
					}
					})
					.on("spinstop", function(e, ui){
						if ($(this).val() != ""){
							$("#" + value.id).data("qualification", this.value)	;
						}})
					.addClass("leftPos").val(value.qualification);
   }
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
	currentColor= "rgb(241,249,155)";
	scrollPosition = 0;
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

/*
Shows/hides spinner (while a page is loading, is better to hide)
*/
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

/* Searchs text in document*/
function searchPage(doc, pageNumber, textToFind) {
  return doc.getPage(pageNumber).then(function (page) {
    return page.getTextContent();
  }).then(function (content) {
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
			pdfContainer.drawSelection(value);
		} 
	});
	
}

/**
 * @description Saves selections from page in the array
 * of selections
 */
function saveSelectionsFromPage() {

	/* Remove current selections already stored*/
	selections = $.map(selections, function (item) 
				{
					if (item.page == inputPage.val()) 
					{
						return null;
					}
					else
					{ 
						return item;
					}
				});

	$("#pageContainer div.selection")
		.each(function(i) {
			var myObject = new Object();
			myObject.page = inputPage.val();
			myObject.posIni = {
				"left": $(this).position().left / currentScale,
				"top": $(this).position().top / currentScale
			};
			myObject.id = "selection" + i + "-" + inputPage.val();
			myObject.title = $(this)
				.find(".topBar")
				.contents()
				.filter(function() {
					return this.nodeType == Node.TEXT_NODE;
				})
				.text();
			myObject.width = $(this).width() / currentScale;
			myObject.height = $(this).height()/ currentScale;
			myObject.backgroundColor = $(this).data("backgroundColor");
			myObject.opacity = $(this).css("opacity");
			myObject.comments = $(this).find("textArea:first").val();
			myObject.checks = $(this).data("checks");
			myObject.windowLocked = $(this).data("windowLocked");
			myObject.qualification = $(this).data("qualification");
			selections.push(myObject);
		});
		alert("Items saved");
}

/**
 * @description Loads toolbar
 */
function loadToolbar() 
{  

	$("#toolbar").draggable();

	createSpinnerPageNumber();

	$("#addIcon")
		.createToolBarButton("New Selection", "ui-icon-plus")
		.click(function() {
			addSelection();
	});
	
	$("#loadIcon")
	.createToolBarButton("Load selections", "ui-icon-script")
	.click(function() {
		loadSelections();
	});

	$("#saveIcon")
	.createToolBarButton("Save selections", "ui-icon-disk")
	.click(function() {
		saveSelections();
	});

	$("#zoomInIcon")
	.createToolBarButton("Zoom in", "ui-icon-zoomin")
	.click(function() {
		zoomIn();
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

/* Loads stored selections */
function loadSelections()
{
	selections = JSON.parse(localStorage.getItem("selections"));
	drawSelectionsInPage();
}

/* Saves selections */
function saveSelections()
{
	saveSelectionsFromPage();
	localStorage.setItem("selections", JSON.stringify(selections));
}

/* Loads the right slider panel */
function loadRightSlider()
{

	$("#slider").slideReveal({
		trigger: $("#rubricPanelHandle"),
		position: "right",
		width: "50%",
		shown: function()
					{
						$("#handleArrow").text("\u21D2");
					},
		hidden: function()
					{
						$("#handleArrow").text("\u21D0");
					},
		push: false
	}).append(
		JSON.parse(localStorage.getItem("rubric")
		));
		$(".rubricItem.rubricQuestion, .rubricItem.rubricSection").prepend(
			function()
			{
				return createCheckBox(this);
			}
		);
		$(".rubricItem.rubricUnordered, .rubricItem.rubricOrdered").prepend(
			function()
			{
				return createCheckBox(this);
			}
		);
}

/* Appends a check box to every item in the rubric */
function createCheckBox(item)
{
	return $("<input/>")
		.attr(
			{
					type:"checkbox",
					id: "chk" + $(item).attr("id"),
			})
		.change(function()
		{
			if (selectedSelection != null)
			{
				var selection = $("#" + selectedSelection);
				var checkedItems = [];

				if (selection.data("checks"))
				{
					checkedItems = selection.data("checks");
				}
				if (this.checked)
				{
					checkedItems.push($(this).attr("id"));
				}
				else
				{
					var valueToFind = $(this).attr("id");
					var itemToRemove = 0;
					$.each(checkedItems, function(i, val)
					{
						if (val == valueToFind)
						{
							itemToRemove = i;
						}
					});
					checkedItems.splice(itemToRemove,1);
				}
				selection.data("checks",  checkedItems);
			}
		});
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
  pdfContainer.drawSelection({
		"id": "selection" + selectionCounter + "-" + inputPage.val(),
		"title": "Selection " + inputPage.val() + " - " + selectionCounter,
		"backgroundColor": currentColor,
		"opacity": currentOpacity,
		"page": inputPage.val(),
		"checks": [],
		"posIni": {
			"left": pdfContainer.position().left,
			"top": pdfContainer.position().top
		},
		height: 400,
		width: 300,
		"comments":"",
		"windowLocked":"off",
		"selectionCounter":selectionCounter,
		"qualification": 100
		});

	}

/* Creates buttons bar for a selection */
function createButtonsBar(value)
{
	var iconSelectedInitial;
	iconSelectedInitial = "ui-icon-unlocked";
	if (value.windowLocked== "on")
	{
		iconSelectedInitial = "ui-icon-unlocked";
	}
	return $("<div>").append($("<input>")
					.attr("id", value.id + "colorPicker")
					.attr("type", "color")
					.addClass("leftPos")
					.css(
						{    
							"padding":"0.1em",
							"width":"2em",
							"height":"2em"}
					)
					.val(rgb2hex(value.backgroundColor))
					.button()
						.on("input", function(e){
							$("#" + value.id).css("background-color", $(this).val());
							currentColor = $(this).val();
							$("#" + value.id).data("backgroundColor",$("#" + value.id).css("background-color")	);
						}))
				.append($("<button>")
					.createToolBarButton("Connect", "ui-icon-tag")
					.addClass("leftPos")
					.click(
						function()
						{
							$("#slider").slideReveal("show");
						}))
				.append($("<button>")
					.createToolBarButton("Block/Unblock", iconSelectedInitial)
					.addClass("leftPos")
					.click(
						function()
						{
							var toggleVar, iconSelected;
							toggleVar = "on";
							iconSelected = "ui-icon-locked";
							if ($("#" + value.id).data("windowLocked")== "on")
							{
								toggleVar = "off";
								iconSelected = "ui-icon-unlocked";
							}
							$(this).button({
								icon: iconSelected
							});
							var box = $("#" + value.id);
							var newStatus = !(box.draggable("option", "disabled"));
							box.data("windowLocked", toggleVar)
								 .draggable({disabled:newStatus})
								 .resizable({disabled:newStatus});
						}))
			.append(addQualification(value).addClass("leftPos"))
			.append($("<button>")
				.createToolBarButton("Close", "ui-icon-close")
				.addClass("rightPos")
				.click(
				function(e)
				{
					e.preventDefault();
					$("#dialog").dialog({
						buttons : {
						  "Confirmar" : function() {
							$("#"+value.id).remove();
							$(this).dialog("close");  
						  },
						  "Cancelar" : function() {
							$(this).dialog("close");
						  }
						}
					  });
				}))
				.append(createSlider(value).addClass("rightPos"));
}

/**
 * @description Creates a slider
 */
function createSlider(value){

	return ($("<div>").css({width: "5em","marginRight":"1.2em", "marginTop":"0.3em"})
	.slider({
		max: 1,
		min: 0.30,
		step: 0.01,
		value: value.opacity,
		slide: function(event, ui) {
			currentOpacity = ui.value;
			$("#"+value.id)
				.css({
				opacity: ui.value
			})
		}
	})
	);

}

/**
 * @description Creates a slider
 */
function addQualification(item){

	return $("<input>").addClass("spinnerQualification").attr("type","text");
	
}

/* Aux Function to convert rgb color to hex format */
function ToHex(x) {
	var hexDigits =["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"]; 
	  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

/* Function to convert rgb color to hex format */
function rgb2hex(rgb) {
	rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	return "#" + ToHex(rgb[1]) + ToHex(rgb[2]) + ToHex(rgb[3]);
}
	

