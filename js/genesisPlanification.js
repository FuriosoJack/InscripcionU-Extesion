$(document).ready(function() {


    var modalIndex = `<div class="ui modal">
            <div class="header">Header</div>
            <div class="content">
                <p></p>
            </div>
            <div class="actions">
                <div class="ui approve button">Approve</div>
                <div class="ui button">Neutral</div>
                <div class="ui cancel button">Cancel</div>
            </div>
        </div>`;
    $("#landingPathMenu").append('<li class="landing-path"><button id="initModalIncripcionesU" class="ui green button">Green</button></li>');
    $("body").append(modalIndex);

    $(document).on('click', "#initModalIncripcionesU", function() {
        $('.modal').modal('setting', {
            onShow: function() {
                $(this).css({
                    'margin': '10px',
                    'position': 'fixed',
                    'top': '0',
                    'bottom': '0',
                    'left': '0',
                    'right': '0',
                    'width': 'auto'
                });
            },
            closable: false
        }).modal('show');
    });

});