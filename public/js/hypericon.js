//Future: FileReader Not Supported! Show classic upload form.
//if (typeof window.FileReader === 'undefined') {
//    
//} else {

var docuElement = $(document.documentElement);

docuElement.on('dragover', function (event) {
    event.preventDefault();
    event.stopPropagation();
});

docuElement.on('dragenter', function (event) {
    event.preventDefault();
    event.stopPropagation();

    $('#drop-overlay').addClass('state-over');
});

docuElement.on('dragleave', function (event) {
    event.preventDefault();
    event.stopPropagation();

    $('#drop-overlay').removeClass('state-over');
});

docuElement.on('dragend', function (event) {
    event.preventDefault();
    event.stopPropagation();

    $('#drop-overlay').removeClass('state-over');
});


function createHyperIcon(fileName, image, id) {
    var shortName = fileName.substring(0, 30);

    var imageElement = $('<div>', {
        class: 'hyperIcon',
        style: 'background-image: url("' + createHyperThumb(image) + '");',
        title: 'Click to view, Ctrl+Click to view the image only.',
        click: function (event) {
            var location = "/" + id;

            if (!event.ctrlKey) {
                location = "/view" + location;
            }

            window.location.href = location;
        }
    });

    for (var i = 0, len = shortName.length; i < len; i++) {
        $('<p>', {
            text: shortName[i],
            style: 'transform: rotate(' + (-60 + i * 12) + 'deg);'
        }).appendTo(imageElement);
    }


    imageElement.appendTo($('#dropzone'));
}

function createHyperThumb(b64) {
    var image = new Image();
    image.src = b64;

    var ratio = 200 / Math.min(image.width, image.height);

    if (ratio > 1) {
        return b64; //Small image, don't resize.
    }

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = image.width * ratio;
    canvas.height = image.height * ratio;

    ctx.scale(ratio, ratio);
    ctx.drawImage(image, 0, 0);

    var dataUrl = canvas.toDataURL("image/jpeg", 0.75);

    if (b64.length < dataUrl.length) {
        return b64; //Resizing made it larger :(
    }

    return dataUrl;
}

docuElement.on('drop', function (event) {
    $('#drop-overlay').removeClass('state-over');

    if (event.originalEvent.dataTransfer) {
        var files = event.originalEvent.dataTransfer.files;

        if (files.length) { //Note: Should we check max length? E.g. 5 images at once, top?
            event.preventDefault();
            event.stopPropagation();

            $.each(files, function (i, file) { //TODO: Optimize post instead of spamming the server.
                if (file.type.indexOf('image/') == 0) {
                    var reader = new FileReader();

                    reader.onload = function (event) {
                        var image = event.target.result;

                        $.post("/", image, function (id) {
                            NProgress.inc();
                            createHyperIcon(file.name, image, id);
                        })
                            .fail(function (xhr, textStatus, errorThrown) {
                                //TODO: Improve error handling
                                if (xhr.status === 429) {
                                    alert('Slow down, bro!');
                                } else {
                                    alert(xhr.responseText);
                                }
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

docu.ajaxStart(function () {
    NProgress.start();
});

docu.ajaxStop(function () {
    NProgress.done();
});