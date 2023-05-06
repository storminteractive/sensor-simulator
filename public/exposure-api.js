const markExposed = (fileName) => {
    $('.status-led').each(function () { $(this).removeClass('status-green').addClass('status-grey'); });
    $(`.file-text:contains('${fileName}')`).closest('.card').find('.status-led').removeClass('status-grey').addClass('status-green');
}

const markUnexposed = (fileName) => {
    // Turning all leds grey
    $('.status-led').each(function () { $(this).removeClass('status-green').addClass('status-grey'); });
}

const exposeApi = (fileName, cb) => {
    $('#exposed-file').text('Loading...');
    $.ajax({
        url: '/expose',
        type: 'POST',
        data: { fileName: fileName },
        success: function (response) {
            $('#exposed-file').text(fileName);
            cb(true);
            console.log(`Expose API response: `,response);
        },
        error: function (err) {
            $('#exposed-file').text(`Error: ${err.statusText}`);
            cb(false);
            console.log(`Expose API error: `,err.statusText);
        }
    });
}

const unexposeApi = (fileName, cb) => {
    $('#exposed-file').text('Loading...');
    $.ajax({
        url: '/unexpose',
        type: 'POST',
        data: { fileName: fileName },
        success: function (response) {
            console.log(`Unexpose API response: `,response);
            $('#exposed-file').text('nothing');
            cb(true);
        },
        error: function (err) {
            $('#exposed-file').text(`Error: ${err.statusText}`);
            cb(false);
            console.log(`Unexpose API error: `,err.statusText);
        }
    });
}

const exposeFileName = (fileName) => {
    console.log('Trying to expose file: ', fileName);

    let currentlyExposed = $('#exposed-file').text();
    if (currentlyExposed === fileName) {
        unexposeApi(fileName,(success) => {
            if(success) markUnexposed(fileName);
        });
        return;
    }

    exposeApi(fileName, (success) => {
        if (success) markExposed(fileName);
    });

}

const getExposedFile = () => {
    $.ajax({
        url: '/getexposed?rnd=' + Math.random().toString().substr(2, 8),
        type: 'GET',
        success: function (response) {
            console.log(`Got exposed file: `,response);
            $('#exposed-file').text(response);
            markExposed(response);
        },
        error: function (err) {
            console.log(`Erorr getting exposed file: `,err.statusText);
        }
    });
}

getExposedFile();