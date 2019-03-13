var rubric;

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
	* @description Function to create toolbar buttons
	* @param labelName: Label
	* @param iconName: Icon
	*/
	$.fn.createBarButton = function(labelName, iconName ) {
		
		this.createToolBarButton(labelName, iconName)
                    .css("height", "16px");
        return this;
    };


    /**
     * @description Adds the add button to an element
     */
    $.fn.addAddButton = function() {

        var parent = this;

        $(this).find(".menubar")
                        .append($("<button>")
                                .createBarButton("add",  "ui-icon-plus")
                                .click(function()
                                {
                                   showDialog(parent, null)
                                }));
        return this;
    };
    
    /**
     * @description Adds the New List button
     * @param items items to add, in case we are loading data
     */
    $.fn.addNewList = function(items) {

        var parentDiv = $(this);
        var ulList = $("<ul>").addClass("rubricList");

        parentDiv.find(".contentRubricItem").append(ulList.sortable());

        if (items != null && items.length>0)
        {
            $(items).each(function(index, elem)
            {
                addLiToList(parentDiv, elem.question, elem.qualification);
            })
        }

        return this;

    };

    /**
     * @description Adds a New Text item
     * @param text, in case we are loading data
     */
    $.fn.addNewText = function(text) {

        $(this).find(".contentRubricItem").append($("<textarea>").addClass("textAreaRubric").text(text));

        return this;

    };
    
}(jQuery));

/**
 * @description when the document is ready
 */
$(document).ready(function() {
    
    setUpEditor();
    loadEditorToolbar();
    loadContextMenu();

});

/**
 * @description Sets up editor
 */
function setUpEditor()
{
    $("#canvasDiv").sortable();
}
/**
 * @description Loads toolbar
 */
function loadEditorToolbar() 
{  

	$("#toolbar").draggable();
	
	$("#btnAddList")
	.createToolBarButton("Add list", "ui-icon-note")
	.click(function() {
		addList();
    });
    
    $("#btnAddText")
    .createToolBarButton("Add text", "ui-icon-comment")
    .click(function() {
		addText();
    });

    $("#btnLoad")
    .createToolBarButton("Load", "ui-icon-script")
    .click(function() {
		loadRubric();
    });

    $("#btnSave")
    .createToolBarButton("Save", "ui-icon-disk")
    .click(function() {
		saveRubric();
    });
	
}

/**
 * Loads context (right click) menu
 */
function loadContextMenu()
{
    var menuItem = $(".custom-menu");

    $("#editOption").click(
        function()
        {
            showDialog($(menuItem.data("parentDiv")), 
                       $(menuItem.data("liElement")));
        }
    )

    $("#deleteOption").click(
        function()
        {
            $(menuItem.data("liElement")).remove();
        }
    )

    // If the menu element is clicked

    menuItem.on("click", "li", function(){
  
        menuItem.hide(100);

    });

}

/**
 * @description Creates a rubric item
 * @param title Name for the item 
 */
function createRubricItem(title) {

    var result = $("<div>").addClass("rubricItem");
    
    return result
            .append($("<div>")
                .addClass("menubar")
                .append($("<span>")
                            .text(title)
                            .addClass("rubricTitle")
                            .contextmenu(
                                function(event)
                                {
                                    event.preventDefault();
                                    $(".custom-menu")
                                        .data("parentDiv", result)
                                        .data("elementType", "bar")
                                        .finish()
                                        .toggle(100)
                                        .css({
                                        top: event.pageY + "px",
                                        left: event.pageX + "px"
                                    });
                                }
                            ))
                .append($("<button>")
                    .createBarButton("close",  "ui-icon-close")
                    .addClass("rightfloatingbutton")
                    .click(function()
                    {
                        result.remove();
                    })))
            .append($("<div>")
                .addClass("contentRubricItem"));
};

/**
 * Adds a list window
 */
function addList()
{
    showTitleDialog("list");
}

/**
 * Adds a text window
 */
function addText()
{
    showTitleDialog("text");
}

/**
 * Adds or updates a li element to a current list
 * @param parentDiv div which contains the list 
 * @param question text with the question or item 
 * @param qualification qualification given
 */
function addLiToList(parentDiv, question, qualification)
{
    var liElement = $("<li>");
    $(parentDiv).find("ul:first").append(
            liElement
            .contextmenu(

                function (event) {
                    
                    event.preventDefault();
                    $(".custom-menu")
                        .data("parentDiv", parentDiv)
                        .data("liElement", liElement)
                        .finish()
                        .toggle(100)
                        .css({
                        top: event.pageY + "px",
                        left: event.pageX + "px"
                    });
                    
                }
            )
            .append($("<div>").addClass("question").text(question))
            .append($("<div>").addClass("qualification").text(qualification))
            );
}

/**
 * Shows a floating window asking for the title for
 * the question
 * @param itemType 
 */
function showTitleDialog(itemType)
{
    $("#nameEntered").val("");
    $("#modalInputName").dialog(
        {
            closeOnEscape: true,
            modal:true,
            buttons:
            {
                "OK": function()
                {
                    $(this).dialog("close");
                    continueAdding(itemType);
                },
                "Cancel": function () {
                    $(this).dialog("close");
                  }
            }    
        }
    );
}

/**
 * Triggered in case the user clicks ok in showTitleDialog
 * @param itemType 
 */
function continueAdding(itemType)
{
    var result = createRubricItem($("#nameEntered").val());

    if (itemType=="list")
    {
        result.addAddButton().addNewList();
    }
    else
    {
        result.addNewText("");
    }

    $("#canvasDiv").append(result);

}

/**
 * Shows dialog
 * @param parentDiv parent div 
 * @param liElement li item to update
 */
function showDialog(parentDiv, liElement)
{

    var blnEdit = !(liElement === null);
    var liE = $(liElement);
    if (blnEdit)
    {
        $("#textEntered").val(liElement.find(".question:first").text());
        $("#nQualification").val(liElement.find(".qualification:first").text());
    }
    else
    {
        $("#textEntered").val("");
        $("#nQualification").val("");
    }
    $("#modalInputList")
        .dialog(
        {
        width: "auto",
        title: "Add/update item to list",
        closeOnEscape: true,
        modal:true,
        buttons: {
            "OK": function () {
              if (blnEdit)
              {
                liE.find(".question:first").text($("#textEntered").val());
                liE.find(".qualification:first").text($("#nQualification").val());
              }
              else
              {
                addLi(parentDiv, $("#textEntered").val(), $("#nQualification").val());
              }
              $("#textEntered").val();
              $(this).dialog("close");
            },
            "Cancel": function () {
              $(this).dialog("close");
            }
        }
        });
}

/**
 * Mousedown event for document
 */
$(document).bind("mousedown", function (e) {

// If the clicked element is not the menu
if (!$(e.target).parents(".custom-menu").length > 0) {
    
    // Hide it
    $(".custom-menu").hide(100);
}
});

/**
 * Saves entire rubric
 */
  function saveRubric()
  {
    var list = [];
    $(".rubricItem").each(
            function(index)
            {
                var myObject = new Object();
                myObject.id = index;
                myObject.title = $(this).find(".rubricTitle:first").text();
                if ($(this).has("ul").length>0)
                {
                    myObject.type = "List";
                    myObject.items = [];
                    $(this).find("li").each(
                        function(index)
                        {
                            myObject.items.push(
                                {
                                    question: $(this).find(".question:first").text(),
                                    qualification: $(this).find(".qualification:first").text()                                    
                                }
                            );
                        }
                    );
                }
                else
                {
                    myObject.type = "Text";
                    myObject.textContained = $(this).find("textarea:first").val();
                }
                list.push(myObject);
            })
    localStorage.setItem("rubric", JSON.stringify(list));
}

/**
 * Loads rubric
 */
function loadRubric()
{
    $("#canvasDiv").empty();
    rubric = JSON.parse(localStorage.getItem("rubric"));
    $.each(rubric, function(index, element) {
        if (element.type == "Text")
        {
            $("#canvasDiv").append(
                createRubricItem(element.title).addNewText(element.textContained)
            );
        }
        else
        {
            $("#canvasDiv").append(
                createRubricItem(element.title).addAddButton().addNewList(element.items)
            );
        }
	});
}