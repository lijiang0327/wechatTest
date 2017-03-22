'use strict';

(function() {
    var interval;
    function watch() {
        $.ajax({
            url: '/wechat/login/watch',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data.return_code === 'SUCCESS') {
                    location.href = '/';
                }
            }
        })
    } 
    $(document).ready(function() {
        if (interval) {
            clearInterval(interval);
        }
        interval = setInterval(watch, 3000);
    });
})();