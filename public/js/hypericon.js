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


function createHyperIcon(fileName, image) {
    var shortName = fileName.substring(0, 30);
    
    var imageElement = $('<div>', {
        class: 'hyperIcon',
        style: 'background-image: url("' + image + '");'
    });

    for (var i = 0, len = shortName.length; i < len; i++) {
         $('<p>', {
            text: shortName[i],
            style: 'transform: rotate(' + (-60+i*12) + 'deg);'
        }).appendTo(imageElement);
    }

    imageElement.appendTo($('#dropzone'));   
}

docuElement.on('drop', function(event) {
    $('#drop-overlay').removeClass('state-over');
    
    if(event.originalEvent.dataTransfer) {
        var files = event.originalEvent.dataTransfer.files;
        
        if(files.length) { //TODO: Max length?
            event.preventDefault();
            event.stopPropagation();
            
            $.each(files, function(i, file) { //TODO: Optimize post.
                if (file.type.indexOf('image/') == 0) {	
                    var reader = new FileReader();  

                    reader.onload = function (event) {
                        console.log(event.target.result);
                        
                        var image = event.target.result;
                                                
                        createHyperIcon(file.name, image);//TODO: Move to success
                        
                        $.post("/", image, function(data) {
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
    NProgress.start();
});

docu.ajaxStop(function() {
    NProgress.done();
});

