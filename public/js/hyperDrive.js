(function () {

    //Future: FileReader Not Supported! Show classic upload form.
    //if (typeof window.FileReader === 'undefined') {
    //    
    //} else {
    var dragCounter = 0; //dragleave triggers when dragging over a child element :(

    var docuElement = $(document.documentElement);

    docuElement.on('dragover', function (event) {
        event.preventDefault();
        event.stopPropagation();
    });

    docuElement.on('dragenter', function (event) {
        event.preventDefault();
        event.stopPropagation();

        dragCounter++;

        $('#drop-overlay').addClass('state-over');
    });

    docuElement.on('dragleave', function (event) {
        event.preventDefault();
        event.stopPropagation();

        dragCounter--;
        if (dragCounter === 0) {
            $('#drop-overlay').removeClass('state-over');
        }
    });


    function createClickEventHandler(id) {
        return (function (event) {
            event.preventDefault();

            //0: left
            //1: middle            
            if (event.button !== 0 && event.button !== 1)
                return;

            var location = "/" + id;

            if (!event.altKey) {
                location = "/view" + location;
            }

            if (event.ctrlKey || event.button === 1) {
                window.open(window.location.origin + location);
            } else {
                window.location.href = location;
            }
        });
    }

    function generateTextOverlay(fileName, element) {

        var shortName = fileName.substring(0, 30);

        for (var i = 0, len = shortName.length; i < len; i++) {
            $('<p>', {
                text: shortName[i],
                style: 'transform: rotate(' + (-60 + i * 12) + 'deg);'
            }).appendTo(element);
        }
    }

    function createHyperDrive(fileName, image, id) {

        var imageElement = $('<div>', {
            class: 'hyperIcon',
            style: 'background-image: url("' + createHyperThumb(image) + '");',
            title: 'Click to view, Alt+Click to view the image only.',
            click: createClickEventHandler(id),
            contextmenu: function () {
                return false;
            }
        });

        generateTextOverlay(fileName, imageElement);

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
        dragCounter = 0;

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
                                createHyperDrive(file.name, image, id);
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


    var dropzone = $('#dropzone');
    dropzone.children('.hyperIcon').each(function (i, icon) {
        var hyperDrive = $(icon);

        var id = hyperDrive.attr('id');
        generateTextOverlay(id, hyperDrive);

        hyperDrive.bind('click', createClickEventHandler(id));

        hyperDrive.bind('contextmenu', function () {
            return false;
        });
    });

    dropzone.show();

})();