// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
(function(){
    window.$ = window.jQuery = require('jquery');

    const {BrowserWindow} = require('electron').remote

    function init() {
        // Minimize task
        document.getElementById("min-btn").addEventListener("click", (e) => {
            var window = BrowserWindow.getFocusedWindow();
            window.minimize();
        });

        // Close app
        document.getElementById("close-btn").addEventListener("click", (e) => {
            var window = BrowserWindow.getFocusedWindow();
            window.close();
        });
    }
    document.onreadystatechange =  () => {
        if (document.readyState == "complete") {
            init();

            ipcRenderer = require('electron').ipcRenderer

            $('#get_info').click(function(){
                var element = $(this);
                $(element).hide();
                $('#loader-action').show();
                ipcRenderer.send('generate_info', '')
                ipcRenderer.once('generate_info', function(event, arg){
                    $('.result').html().show();
                    $('#loader-action').hide();
                    $(element).show();
                    // $('.result').append('<a href="'arg.res'">')
                })
            })
        }
    };
})();
