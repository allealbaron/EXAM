/** Global variables */
var rubricsList = [];
var currentRubric = null;
var globalCounter = 0;

/**
 * ready function
 */
$(document).ready(function(){

      rubricsList = JSON.parse(localStorage.getItem("rubricsList"));

      setEditor();
      
      loadRubrics();

});

/**
 * Sets up editor
 */
function setEditor(){

  tinymce.PluginManager.add('addQualificationNumber', function (editor) {
    editor.ui.registry.addMenuItem('addqmenu', {
      icon: 'info',
      text: 'Establecer calificación',
      onAction: function () {            
        setQualification(editor);
    }});
  
    editor.ui.registry.addContextMenu('addqmenu', {
      update: function (element) {
        return (element.tagName.toLowerCase() != "h3") ? '' : 'addqmenu';
      }
    });
  });

  tinymce.init({
    language_url: "./js/es.js",
    language: "es",
    spellchecker_language: "es",
    selector: "#textEditor",
    contextmenu: "addqmenu",
    menu: {
      file: {title: "File", items: "newdocumentCustom opendocument savedocument deletedocument"},
      edit: {title: "Edit", items: "undo redo | cut copy paste pastetext | selectall"},
      insert: {title: "Insert", items: "link | hr"},
      view: {title: "View", items: "visualaid"},
      format: {title: "Format", items: "bold italic underline strikethrough | removeformat"},
      table: {title: "Table", items: "inserttable tableprops deletetable | cell row column"},
      tools: {title: "Tools", items: "spellchecker code"}
    },
    toolbar: "newdocumentCustom opendocument savedocument deletedocument | addPregunta addListaDesordenada AddListaOrdenada setQualification | bold italic strikethrough forecolor backcolor link | table | outdent indent | alignleft aligncenter alignright alignjustify  | code removeformat ",
    plugins: "addQualificationNumber code print preview fullpage searchreplace autoresize autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime lists wordcount imagetools textpattern help",
    style_formats: [
      {title: "Pregunta", block: "h3", classes: "rubricItem rubricQuestion"},
      {title: "Subapartado", block: "h4", classes: "rubricItem rubricSection"},
      {title: "Párrafo", block: "p", classes: "rubricItem rubricParagraph"},
      {title: "Lista", block: "span", classes: "rubricItem rubricList rubricUnordered"},
      {title: "Lista ordenada", block: "span", classes: "rubricItem rubricList rubricOrdered"}
    ],
    content_css: [
      "//fonts.googleapis.com/css?family=Lato:300,300i,400,400i",
      "//www.tiny.cloud/css/codepen.min.css"],
    setup: function (editor) {

      addCustomMenuItems(editor);

      addCustomButtons(editor);

      editor.on("change", function(e) {

        drawTable();

    });
   
  }  
})
.then(
  function()
  {
    // Sets editor as readonly
    tinymce.activeEditor.getBody().setAttribute("contenteditable", false);
 
  });
};

/**
 * Add Custom Menu Items
 * @param {*} editor 
 */
function addCustomMenuItems(editor)
{

  editor.ui.registry.addMenuItem("newDocumentCustom", {
    text: "Nueva rúbrica",
    icon: "new-document",
    onAction: function(){ newDocumentCustom();}
  });
  
  editor.ui.registry.addMenuItem("opendocument", {
    text: "Seleccionar rúbrica",
    icon: "browse",
    onAction: function(){ openDocument(false);}
  });

  editor.ui.registry.addMenuItem("savedocument", {
    text: "Guardar rúbrica",
    icon: "save",
    onAction: function(){ saveDocument();}
  });

  editor.ui.registry.addMenuItem("deletedocument",{
    text: "Eliminar rúbrica",
    icon: "remove",
    onAction: function(){ openDocument(true);}
  });

}

/**
 * Adds custom buttons
 * @param {*} editor 
 */
function addCustomButtons(editor)
{
  editor.ui.registry.addButton("newDocumentCustom", {
    tooltip: "Nueva rúbrica",
    icon: "new-document",
    onAction: function(){ newDocumentCustom();}
  });
  
  editor.ui.registry.addButton("opendocument", {
    tooltip: "Seleccionar rúbrica",
    icon: "browse",
    onAction: function(){ openDocument(false);}
  });

  editor.ui.registry.addButton("savedocument", {
    tooltip: "Guardar rúbrica",
    icon: "save",
    onAction: function(){ saveDocument();}
  });

  editor.ui.registry.addButton("deletedocument",{
    tooltip: "Eliminar rúbrica",
    icon: "remove",
    onAction: function(){ openDocument(true);}
  });

  editor.ui.registry.addButton("addPregunta", { 
    tooltip: "Pregunta",
    icon: "comment",   
    onAction: function () {
      var itemSelected = editor.selection.getNode();
      if (itemSelected.tagName.toLowerCase() != "h3")
      {
        if (itemSelected.tagName.toLowerCase() != "body"){
        var newItem = $("<p>");
        var twoItems = false;
        $(itemSelected).find("p").each(function(){
            newItem.append($("<h3>")
                    .addClass("rubricItem rubricQuestion")
                    .text($(this).text()));
                    twoItems = true;
        });
        if (!twoItems)
        {
          newItem.append($("<h3>")
          .addClass("rubricItem rubricQuestion")
          .text($(itemSelected).text()));
        }
        tinymce.activeEditor.selection.setContent(newItem.html());
      }
      else
      {
        alert("Seleccione los elementos de uno en uno");
      }
      }
      else
      {
        tinymce.DOM.removeClass(itemSelected, "rubricItem rubricQuestion");
        tinyMCE.execCommand("formatblock", false, "h3");
      }
      reArrangeIds();
      drawTable();
    }
  });

  editor.ui.registry.addButton("addListaOrdenada", { 
    tooltip: "Lista ordenada",
    icon: "ordered-list",   
    onAction: function () {
     
      tinyMCE.execCommand("InsertOrderedList", false);
      var itemSelected = editor.selection.getNode();
      var listId = getNextListId();
      tinymce.DOM.setAttrib(itemSelected, "id", listId);
      $.each($(itemSelected).find("li"), 
        function(index, element)
        {
          $(element).addClass("rubricItem rubricList rubricOrdered");
          $(element).attr("id", getNextListItemId(listId));
        });
      }
  });

  editor.ui.registry.addButton("addListaDesordenada", { 
    tooltip: "Lista desordenada",
    icon: "unordered-list",
    onAction: function () {
      tinyMCE.execCommand("InsertUnorderedList", false);
      var itemSelected = editor.selection.getNode();
      var listId = getNextListId();
      tinymce.DOM.setAttrib(itemSelected, "id", listId);
      $.each($(itemSelected).find("li"), 
        function(index, element)
        {
          $(element).addClass("rubricItem rubricList rubricUnOrdered");
          $(element).attr("id", getNextListItemId(listId));
        });
      }});

  editor.ui.registry.addButton("setQualification", {
    tooltip: "Establecer calificación",
    icon: "info",
    onAction: function () {
      if (editor.selection.getNode().tagName.toLowerCase() == "h3"){
        setQualification(editor);
      }
      else{
        alert("Sólo se pueden poner calificaciones a las preguntas");
      };
    }});

}

/**
 * Returns next Question Id
 */
function getNextQuestionId()
{
  var exitCondition = false;
  var literal = "rubricQuestion";
  var counter = globalCounter;
  while (!exitCondition)
  {
    if ($("#textEditor_ifr").contents().find("#" + literal + counter).length == 0)
    {
      globalCounter++;
      exitCondition = true;
    }
    counter++;  
  }
  return (literal + (counter-1));
}

/**
 * Returns next list id
 */
function getNextListId()
{
  var exitCondition = false;
  var literal = "List";
  var counter = 0;
  while (!exitCondition)
  {
    if ($("#textEditor_ifr").contents().find("#" + literal + counter).length == 0)
    {
      exitCondition = true;
    }
    counter++;  
  }
  return (literal + (counter-1));
}

/**
 * Returns next list item id
 * @param {*} prefix Prefix
 */
function getNextListItemId(prefix)
{
  var exitCondition = false;
  var literal = prefix + "ListItem";
  var counter = 0;
  while (!exitCondition)
  {
    if ($("#textEditor_ifr").contents().find("#" + literal + counter).length == 0)
    {
      exitCondition = true;
    }
    counter++;  
  }
  return (literal + (counter-1));
}

/**
 * Looks for a rubric. If exists, returns true
 * @param {*} rubricName 
 */
function findRubric(rubricName)
{
  var result = false;

  $.each(rubricsList, function (i, item) {
    if (item.id == rubricName)
    {
      result = true;
      return false;
    }
  });

  return result;

}

/**
 * Shows confirm dialog when the user
 * wants to overwrite a rubric
 */
function showDialogConfirm()
{
  $("#dialogExistingRubric").dialog({
    buttons:{
      "Aceptar": function(){
          $(this).dialog("close");
          createNewRubric();
        },
      "Cancelar":function(){
          $(this).dialog("close");
          showDialogNewRubric(false);
        }
      }});
}

/**
 * show dialog when the user wants to create
 * a new rubric
 */
function showDialogNewRubric(clearCell)
{
    if (clearCell)
    {
      $("#newRubricName").val("");
    }

    $("#dialogNewRubric").dialog({
      modal:true,
		  buttons:{
			"Aceptar": function(){

          if (!($("#newRubricName").val() === "")){
            
            if (findRubric($("#newRubricName").val())){
              if (showDialogConfirm()){
                createNewRubric();
                $("#dialogNewRubric").dialog("close");
              }              
            }
            else{
              createNewRubric();
              $("#dialogNewRubric").dialog("close");
            }
          }
          else
          {
            alert("Debe introducir un nombre para la rúbrica");
          }
          $("#dialogNewRubric").dialog("close");
        },
			"Cancelar" : function() {
        $("#dialogNewRubric").dialog("close");
			  }
		}});
}

/**
 * Creates an empty new rubric
 */
function createNewRubric()
{
  createRubric($("#newRubricName").val(), "");
  tinymce.execCommand("mceNewDocument");
  tinymce.activeEditor.getBody().setAttribute("contenteditable", true);

}

/**
 * Creates the rubric with the specified params  
 */
function createRubric(idSelected, rubricSelected)
{
  currentRubric = {"id": idSelected, 
                   "rubric": rubricSelected };
}

/**
 * shows dialog before deleting a rubric
 */
function showDialogDeleteRubric(selectedId)
{
  $("#dialogDeleteRubric").dialog({
    buttons:{
      "Aceptar": function(){
        $(this).dialog("close");
        deleteRubric(selectedId);
      },
      "Cancelar":function(){
        $(this).dialog("close");
      }
    }
  }
  );
}

/**
 * Creates a new Rubric
 */
function newDocumentCustom()
{

  showDialogNewRubric(true);
  
}

/**
 * Opens dialog to select a rubric
 */
function openDocument(deleteEnabled)
{
  $("#dialogSelections").dialog({
    width:"auto",
		buttons : {
		  "Nuevo": {
        disabled: deleteEnabled,
        text: "Nuevo",
        click:function(){
        if (newDocumentCustom())
        {
          $(this).dialog("close");
        }}
      },
      "Abrir" : {
        disabled: deleteEnabled,
        text: "Abrir",
        click: function() {
        var selectedItem = $("#selectionsOptionsList").children("option:selected");
			  if (selectedItem.length>0){
          createRubric(selectedItem.data("id"),selectedItem.data("rubric"));
          tinymce.activeEditor.setContent(selectedItem.data("rubric"));
          tinymce.activeEditor.getBody().setAttribute("contenteditable", true);
          drawTable();
          $(this).dialog("close");    	
			  }
			  else
			  {
				  alert("Debe seleccionar un elemento");
			  }
        }
      },
		  "Cancelar" : function() {
			  $(this).dialog("close");
      },
      "Borrar": function() {
        var selectedItem = $("#selectionsOptionsList").children("option:selected");
			  if (selectedItem.length>0){
          showDialogDeleteRubric(selectedItem.data("id"));
          $(this).dialog("close");    	
			  }
			  else
			  {
				  alert("Debe seleccionar un elemento");
			  }
      }
		}
	  });
}

/**
 * Deletes a rubric
 * @param {} rubricName 
 */
function deleteRubric(rubricName)
{
  var itemToRemove = 0;
  $.each(rubricsList, function(i, val)
  {
    if (val.id == rubricName)
    {
      itemToRemove = i;
    }
  });
  rubricsList.splice(itemToRemove,1);
  localStorage.setItem("rubricsList", JSON.stringify(rubricsList));
  loadRubrics();

}

/**
 * Saves rubric item with its id
 */
function saveDocument()
{
  saveRubric();

  if (findRubric(currentRubric.id))
  {
    deleteRubric(currentRubric.id);
  }

  rubricsList.push(currentRubric);

  localStorage.setItem("rubricsList", JSON.stringify(rubricsList));

}

/**
 * Rearrange ids in case any id is duplicated
 */
function reArrangeIds()
{
  var completeList = $(tinymce.activeEditor.dom.select("h3"));
    completeList.each(function(){
    if ($(this).text()== "")
    {
      $(this).remove();
    }
    else{    
      if ($(this).attr("id") == null)
      {
        $(this).attr("id", getNextQuestionId()).addClass("rubricItem rubricQuestion");
      }
      else
      {
        var ids = $(tinymce.activeEditor.dom.select("[id='"+ $(this).attr("id") + "']"));
        if(ids.length>1)
        {
          $(tinymce.activeEditor.dom.select("[id='"+ $(this).attr("id") + "']:gt(0)")).each(function(){
            $(this).attr("id", getNextQuestionId()).addClass("rubricItem rubricQuestion");
          })
        }
        }
      }});

}

/**
 * Saves rubric item
 */
function saveRubric()
{  

  reArrangeIds();

  currentRubric.rubric = $("<div>").append($(tinymce.activeEditor.getContent({format : "raw"}, "text/html")));
  currentRubric.rubric = currentRubric.rubric.html();

}

/**
 * Loads rubrics in the selection dialog
 */
function loadRubrics()
{
  var rubricsObject = JSON.parse(localStorage.getItem("rubricsList"));
  var sel = $("<select>").attr({
				"size": rubricsObject.length,
				"id": "selectionsOptionsList"}).css({"width": "100%"});
	$.each(rubricsObject	, function(i, val)
	{
  	sel.append($("<option>")
			.text(val.id)
			.attr("value", val.id)
			.data("id", val.id)
      .data("rubric", val.rubric));
	});
  $("#dialogSelections").empty();
	$("#dialogSelections").append(sel);
}

/**
 * Draws table with current qualifications
 */
function drawTable(){
  $("#qualificationsTable").css({"display":"block"});
  $("#qualificationsTable").find("tr:gt(0)").remove();
  var domparser = new DOMParser();
  $.each(
    $(domparser.parseFromString(tinymce.activeEditor.getContent({format : "raw"}), "text/html")).find(".rubricQuestion"), 
  function(index, element){
    var classNameTable = "odd";
    if (index%2==0)
    {
      classNameTable = "even";
    }
    $("#qualificationsTable").append(
      $("<tr>")
      .append($("<td>").text($(element).text()).addClass(classNameTable))
      .append($("<td>").text($(element).attr("title")).addClass(classNameTable)));
  });

}

/**
 * sets qualification for a selected item
 * @param {*} editor 
 */
function setQualification(editor){
  var nodeSelected = $(editor.selection.getNode());
       $("#qualificationNumber").val(nodeSelected.attr("title"));
       $("#dialogQualification").dialog({
        buttons:{
          "Aceptar": function(){
              if ($("#qualificationNumber").val()>100 || $("#qualificationNumber").val()<0)
              {
                alert("El valor debe estar entre 1 y 100");
              }
              else
              {
                $(editor.selection.getNode()).attr("title", $("#qualificationNumber").val());
                reArrangeIds();
                drawTable();              
                $(this).dialog("close");
              }
            },
          "Cancelar":function(){
              $(this).dialog("close");
            }    
          }});
}