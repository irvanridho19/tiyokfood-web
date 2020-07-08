(function() {
    'use.strict';

    $('nav.nav-pills > a').on('click', function(e){

        e.preventDefault();

        $('nav.nav-pills > a').removeClass('active');
        $(this).addClass('active');
    });

})(jQuery);