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
var blnSliderShowed;

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
	   var initialState = (value.windowLocked == "on");
	   newDiv
		   .draggable({
			   containment: pdfContainer,
			   disabled: initialState
		   })
		   .resizable({
			   containment: pdfContainer,
			   disabled: initialState,
			   minWidth: "350",
			   minHeight: "150",
			   handles: "all"
		   })
		   .data("title", value.title)
		   .data("checks", value.checks)
		   .data("radio", value.radio)
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
				   $("#slider").find("input[type=radio]").prop("checked",false);
				   $.each($(this).data("checks"), function(index, value) {
					   $("#" + value).prop("checked", true);
				   });
				   var dataRatio = $(this).data("radio"); 
				   if (dataRatio != null && dataRatio!= "")
				   {
					   $("#" + dataRatio).prop("checked",true);
				   }
		   })
		   .append($("<span>")
					   .text(value.title)
					   .prop("contentEditable",true)
					   .click(
						   function()
						   {
							   $(this).focus();
							})
						.blur(
							function()
							{
								$("#"+ selectedSelection).data("title", $(this).text());
							}
						)
					)
		   .append(createButtonsBar(value))
		   .append($("<div>").addClass("divTextAreaSelection")
		   .append($("<textarea>").addClass("textAreaSelection").draggable({
			   containment: newDiv
		   }).val(value.comments)));

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
	blnSliderShowed = false;

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

/**
 * @description Shows/hides spinner (while a page is loading, is better to hide)
 * @param displayValue new value to apply
 */
function toggleSpinner(displayValue)
{
	$(" .ui-spinner a.ui-spinner-button").css("display", displayValue);

}

/**
 * @description Loads the specified page selected in inputPage
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

/**
 * @description Searchs text in document
 * @param doc: doc which contains the text
 * @param pageNumber: current page number
 * @param textToFind: text to find
 */
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

	$("#pageContainer div.selection").remove();
	$.each(selections, function(index, value) {
		if (value.page == inputPage.val()) {
			pdfContainer.drawSelection(value);
		} 
	});
	
}

/**
 * @description Saves selections from page in the
 * selections array
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
			myObject.title = $(this).data("title");
			myObject.width = $(this).width() / currentScale;
			myObject.height = $(this).height()/ currentScale;
			myObject.backgroundColor = $(this).data("backgroundColor");
			myObject.opacity = $(this).css("opacity");
			myObject.comments = $(this).find("textArea:first").val();
			myObject.checks = $(this).data("checks");
			myObject.radio = $(this).data("radio");
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
		sliderMovement(blnSliderShowed);
		blnSliderShowed = !blnSliderShowed;
	});
		
}

/**
 * @description Loads stored selections */
function loadSelections()
{
	selections = JSON.parse(localStorage.getItem("selections"));
	drawSelectionsInPage();
}

/**
 * @description Saves selections */
function saveSelections()
{
	saveSelectionsFromPage();
	localStorage.setItem("selections", JSON.stringify(selections));
}

/**
 * @description Changes right slider position
 * @param {boolean} expand: if true, expands the slider. If false, the
 * slider is collapsed.
 */
function sliderMovement(expand)
{
		
		var newMargin = 0;
		var newImg = "ext/images/rightArrow.png";
		var newAlt = "Abrir";
	
		if (expand)
		{
			newMargin = "-800px";
			newImg = "ext/images/leftArrow.png";
			newAlt = "Cerrar";
		}

		$("#slider").stop().animate({"margin-right": newMargin});
		$("#pullimg").prop({"src":newImg, "alt":newAlt});

}

/**
 * @description Loads the right slider panel
 */
function loadRightSlider()
{

	$("#pull").bind("click", function(){
		sliderMovement(blnSliderShowed);
		blnSliderShowed = !blnSliderShowed;
	
	});
	
	$("#slider").append(
		JSON.parse(localStorage.getItem("rubric")
		));
		
		$(".rubricItem.rubricQuestion, .rubricItem.rubricSection").prepend(
			function()
			{
				return $("<input>")
						.prop(
						{
							type:"radio",
							name: "radioSelection",
							id: "rdb" + $(this).prop("id"),
						})
						.change(function()
						{
							if (selectedSelection != null)
							{
								$("#" + selectedSelection).data("radio",  $(this).prop("id"));
							}
						});
			}
		);
		
		$(".rubricItem.rubricUnordered, .rubricItem.rubricOrdered").prepend(
			function()
			{
				return $("<input>")
						.prop(
							{
									type:"checkbox",
									name:"chk" + $(this).prop("id"),
									id: "chk" + $(this).prop("id")
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
									checkedItems.push($(this).prop("id"));
								}
								else
								{
									var valueToFind = $(this).prop("id");
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
						}
				);
			}
		);
	
	$("#slider").stop().animate(
		{"margin-right":"-800px"}, 1000);
		
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
		"radio":"",
		"posIni": {
			"left": pdfContainer.position().left,
			"top": pdfContainer.position().top
		},
		height: 400,
		width: 350,
		"comments":"",
		"windowLocked":"off",
		"selectionCounter":selectionCounter,
		"qualification": 100
		});

	}

/**
 * Creates buttons bar for a selection
 * @param {*} value 
 */
function createButtonsBar(value)
{
	var iconSelectedInitial;
	iconSelectedInitial = "ui-icon-unlocked";
	if (value.windowLocked== "on")
	{
		iconSelectedInitial = "ui-icon-unlocked";
	}
	return $("<div>").append($("<input>")
					.prop("id", value.id + "colorPicker")
					.prop("type", "color")
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
							var buttonItem = $("#" + value.id);
							buttonItem.css("background-color", $(this).val());
							currentColor = $(this).val();
							buttonItem.data("backgroundColor",buttonItem.css("background-color")	);
						}))
				.append($("<button>")
					.createToolBarButton("Connect", "ui-icon-tag")
					.addClass("leftPos")
					.click(
						function()
						{
							sliderMovement(false);
							blnSliderShowed = true;
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
			.append($("<input>").addClass("spinnerQualification").prop("type","text").addClass("leftPos"))
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

	return ($("<div>")
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
	}).addClass("sliderClass")
	);

}

/**
 * @description Aux Function to convert rgb color to hex format
 * @param x: Number to convert 
 */
function ToHex(x) {
	var hexDigits =["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"]; 
	  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

/**
 * Function to convert rgb color to hex format
 * @param {*} rgb: rgb color
 */
function rgb2hex(rgb) {
	rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	return "#" + ToHex(rgb[1]) + ToHex(rgb[2]) + ToHex(rgb[3]);
}