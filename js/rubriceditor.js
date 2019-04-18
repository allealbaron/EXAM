 
 $(document).ready(function()
    {

    $("#btnSaveRubric").click(
        function()
        {
            localStorage.setItem("rubric", JSON.stringify(tinymce.activeEditor.getContent()));
            alert(tinymce.activeEditor.getContent());

        }
    );

  tinymce.init({
    language_url: './js/es.js',
    language: "es",
    spellchecker_language: 'es',
    selector: '#textEditor',
    toolbar: 'styleselect  | bold italic strikethrough forecolor backcolor | link | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent | code removeformat ',
    plugins: 'code print preview fullpage powerpaste searchreplace autolink directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime lists wordcount tinymcespellchecker a11ychecker imagetools textpattern help formatpainter permanentpen pageembed linkchecker',
    style_formats: [
      {title: 'Pregunta', block: 'h1', classes: 'contentRubricItem'},
      {title: 'Subapartado', block: 'h2', classes: 'contentRubricItem'},
      {title: 'Párrafo', block: 'p', classes: 'contentRubricItem'},
      {title: 'Lista', block: 'ul', classes: 'contentRubricItem'},
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