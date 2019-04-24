/**
  * @description Main Function
*/
$(document)
	.ready(function() {

		$.get('http://localhost/exam/pdf', (data) => 
    {
				var listItems = $("<ul>");
				$(parseDirectoryListing(data)).each(function(index, value)
				{
					listItems.append($("<li>").text(value));
				});
				$("body").append(listItems);
		});

		$(".fileLink").click(function(event)
		{
			event.preventDefault();

			toDataUrl($(this).attr("href"), function(myBase64) {

				//window.location.href = "visor.html?base64=" & myBase64;
				//alert(); // myBase64 is the base64 string

/*
				redirectPost("/exam/visor.html", {"base64": 
				'JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwog' +
				'IC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAv' +
				'TWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0K' +
				'Pj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAg' +
				'L1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+' +
				'PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9u' +
				'dAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2Jq' +
				'Cgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJU' +
				'CjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVu' +
				'ZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4g' +
				'CjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAw' +
				'MDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9v' +
				'dCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G'});
*/
				//btoa(myBase64)
				alert(escape(myBase64));
				redirectPost("/exam/visor.html", {"base64": (myBase64)});
		});

		});
	
		
	});

	function redirectPost(url, data) {
    var form = document.createElement('form');
    document.body.appendChild(form);
    form.method = 'get';
    form.action = url;
    for (var name in data) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = escape(data[name]);
        form.appendChild(input);
    }
    form.submit();
}


	function toDataUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

	function parseDirectoryListing(text) 
	{
			let docs = text
									 .match(/href="([\w]+\.[\w]+)/g)
									 .map((x) => x.replace('href="', ''));
			return docs;
	}   