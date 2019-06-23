 
 $(document).ready(function()
    {

    $("#btnSaveRubric").click(
        function()
        {
          var itemsInEditor = $("<div>").append($(tinymce.activeEditor.getContent({format : 'raw'})));

          $.each(itemsInEditor.find(".rubricQuestion"), 
          function(index, element)
          {
            $(element).attr("id", "rubricQuestion" + index);
          });

          $.each(itemsInEditor.find(".rubricSection"), 
          function(index, element)
          {
            $(element).attr("id", "rubricSection" + index);
          });


          $.each(itemsInEditor.find("ul"), function(index, element)
          {
            $(element).attr("id", "rubricUnordered" + index)
                      .children().each(
                        function(indexLi, elementLi)
                        {
                          $(elementLi)
                          .attr("id", "rubricUnordered" + index + "rubricSection" + indexLi)
                          .addClass("rubricUnordered rubricItem");
                        }
                      );
          });

          $.each(itemsInEditor.find("ol"), function(index, element)
          {
            $(element).attr("id", "rubricOrdered" + index)
                      .children().each(
                        function(indexLi, elementLi)
                        {
                          $(elementLi)
                          .attr("id", "rubricordered" + index + "rubricSection" + indexLi)
                          .addClass("rubricOrdered rubricItem");
                        }
                      );
          });


            localStorage.setItem("rubric", JSON.stringify(itemsInEditor.html()));



            alert(itemsInEditor.html());

        }
    );

  tinymce.init({
    language_url: './js/es.js',
    language: "es",
    spellchecker_language: 'es',
    selector: '#textEditor',
    toolbar: 'styleselect  | bold italic strikethrough forecolor backcolor | link | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent | code removeformat ',
    plugins: 'code print preview fullpage searchreplace autoresize autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime lists wordcount imagetools textpattern help',
    style_formats: [
      {title: 'Pregunta', block: 'h3', classes: 'rubricItem rubricQuestion'},
      {title: 'Subapartado', block: 'h4', classes: 'rubricItem rubricSection'},
      {title: 'P?rrafo', block: 'p', classes: 'rubricItem rubricParagraph'},
      {title: 'Lista', block: 'span', classes: 'rubricItem rubricList rubricUnordered'},
      {title: 'Lista ordenada', block: 'span', classes: 'rubricItem rubricList rubricOrdered'}
  ],
  content_css: [
      '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
      '//www.tiny.cloud/css/codepen.min.css'],

    setup: function (editor) {
      ;
    }  
}).then(
  function()
  {
    tinymce.get('textEditor').setContent(JSON.parse(localStorage.getItem("rubric")));
  }
)

    });