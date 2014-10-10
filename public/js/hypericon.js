//TODO: FileReader Not Supported! Show classic upload form.
//if (typeof window.FileReader === 'undefined') {
//    
//} else {

var docuElement = $(document.documentElement);

docuElement.on('dragover', function(event) {
    event.preventDefault();  
    event.stopPropagation();
});

docuElement.on('dragenter', function(event) {
    event.preventDefault();  
    event.stopPropagation();
    
    $('#drop-overlay').addClass('state-over');
});

docuElement.on('dragleave', function(event) {
    event.preventDefault();  
    event.stopPropagation();
    
    $('#drop-overlay').removeClass('state-over');
});

docuElement.on('dragend', function(event) {
    event.preventDefault();  
    event.stopPropagation();
    
    $('#drop-overlay').removeClass('state-over');
});

docuElement.on('drop', function(event) {
    $('#drop-overlay').removeClass('state-over');
    
    if(event.originalEvent.dataTransfer) {
        var files = event.originalEvent.dataTransfer.files;
        
        if(files.length) { //TODO: Check Max length?
            event.preventDefault();
            event.stopPropagation();
            
            $.each(files, function(i, file) { //TODO: Optimize post.
                if (file.type.indexOf('image/') == 0) {	
                    var reader = new FileReader();  

                    reader.onload = function (event) {
                        var image = event.target.result;
                        image = image.substring(image.indexOf("base64,")+7);

                        console.log(image);

                        $.post("/", image, function(data) {
                            //TODO: Attach image to dropzone.
                            NProgress.inc();
                        })
                        .fail(function() {
                            alert( "error" );
                            NProgress.inc();
                        });
                    };	  

                    reader.readAsDataURL(file);
                }
            });
            
        }
    }
});

//}


var docu = $(document);

docu.ajaxStart(function() {
    console.log('start');
    NProgress.start();
});

docu.ajaxStop(function() {
    console.log('stop');
    NProgress.done();
});

