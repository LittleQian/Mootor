(function ($) {

    //console.log("index view init");

    var view = m.app.view("index");
    
    view.on("load", function() {
       // console.log("index view loaded");
    });
    
    $("#btnLogin").on("click", function() {
        m.app.go("#testview.html");
    });


}(window.$));
