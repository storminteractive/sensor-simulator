formUploadFile = () => {
    const formData = new FormData();
    const file = $('#file-input')[0].files[0];
    formData.append('file', file);
    
    const progressBar = $('.progress-bar');
    const speedDiv = $('.speed');
    let lastLoaded = 0;
    let lastTimeStamp = Date.now();

    $.ajax({
        xhr: function () {
            const xhr = $.ajaxSettings.xhr();
            if (xhr.upload) {
                xhr.upload.addEventListener('progress', function (e) {
                    //console.log(e);
                    let speedMbps = Math.round((e.loaded - lastLoaded) / (Date.now() - lastTimeStamp) / 1024);
                    speedDiv.text(`${speedMbps.toFixed(3)} MBps`);
                    const percent = Math.round((e.loaded / e.total) * 100);
                    progressBar.text(`${percent}%`);
                    progressBar.css('width', `${percent}%`);
                    lastLoaded = e.loaded;
                    lastTimeStamp = Date.now();
                });
            }
            return xhr;
        },
        url: '/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            console.log(`File successfully uploaded: `,response);
            window.location.reload();
        }, 
        error: function (err) {
            console.log(`Error uploading file:`,err);
            $('#speedDiv').text(`Error: ${err.status}`);
        }
    });
}

$('#upload-form').submit(function (e) {
    e.preventDefault();
    formUploadFile();
});

$('#file-list').on('click', '.delete-button', function () {
    
});

const deleteFile = (fileName) => {
    unexposeApi(fileName, (success) => {});
    $(`.file-text:contains('${fileName}')`).closest('.card').find('.delete-button').text('Deleting...').prop('disabled', true);

    $.ajax({
        url: '/delete',
        type: 'POST',
        data: { fileName: fileName },
        success: function (response) {
            console.log(`File successfully deleted: `,response);
            $(`.file-text:contains('${fileName}')`).closest('.card').remove();
        },
        error: function (err) {
            console.log(`Error deleting file: `,err.statusText);
            $(`.file-text:contains('${fileName}')`).closest('.card').find('.file-text').text(err.statusText).prop('disabled', false);
        }
    });
}

const addFile = (fileName) => {
    const card = $(`
    <div class="card mb-3 file-list-element">
        <div class="card-body">
            <div class="d-flex align-items-center file-desc">
                <div class="status-led status-grey"></div>
                <div class="drag-handle" style="margin-right: 10px; cursor: grab;">&#9776;</div>
                <div class="flex-grow-1 file-text"><a href="/download/${fileName}" style="text-decoration: none;">${fileName}</a></div>
                <button class="btn btn-primary expose-button" style="margin-right: 5px;" onClick="exposeFileName('${fileName}');">Expose</button>
                <button class="btn btn-danger delete-button" onClick="deleteFile('${fileName}');">Delete</button>
            </div>
        </div>
    </div>
    `);
    $('#file-list').append(card);
}

const getFiles = () => {
    $('#file-list').addClass('spinner');

    $.ajax({
        url: '/getfiles',
        type: 'GET',
        success: function (response) {
            $('#file-list').empty().removeClass('spinner');
            //console.log(response);
            response.forEach(fileName => {
                addFile(fileName);
            });
        }
    });
}

getFiles();