(function( $ ) {

	/**
	 * @description Function to create table
	*/
	$.fn.createTable = function() {
		
        var theadItem = $("<thead>");
    
        $(JSON.parse(localStorage.getItem("rubric"))).each(function(index, value) {
            
            var type= $(value)[0].tagName.toUpperCase();
            
            if (type == "OL" || type == "UL")
            {
    
                $(value).children().each(function(index2, value2)
                {
                    theadItem.append($("<th>").prop("id", $(value2).prop("id")).text($(value2).text()));
                });
            }
            else
            {
                theadItem.append($("<th>").prop("id", $(value).prop("id")).text($(value).text()));
            }
        });

        return this.append($("<table>").addClass("tableResults").append(theadItem));    

    };
    
    /**
	 * @description Function to create table
	*/
	$.fn.loadResults = function() {
		
       // var theadItem = $("<thead>");
    
        $(JSON.parse(localStorage.getItem("selections"))).each(function(index, value) {

            alert(value.checks);
            
            /*var type= $(value)[0].tagName.toUpperCase();
            
            if (type == "OL" || type == "UL")
            {
    
                $(value).children().each(function(index2, value2)
                {
                    theadItem.append($("<th>").text($(value2).text()));
                });
            }
            else
            {
                theadItem.append($("<th>").text($(value).text()));
            }
            */
        });

        return this;    

	};


}(jQuery));


/*
  * @description Main Function
*/
$(document)
	.ready(function() {

        $("body").createTable().loadResults();
	
    });
