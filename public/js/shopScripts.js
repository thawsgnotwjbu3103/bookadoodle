var scripts = document.getElementsByTagName('script');
var lastScript = scripts[scripts.length-1];
var scriptName = lastScript;
var length = scriptName.getAttribute("data-length");
for(let index = 0; index < parseInt(length); index++){
    $(`#addToCart_${index}`).submit(function (e) {
        e.preventDefault();
        $.ajax({
            url: $(`#addToCart_${index}`).attr("action"),
            type: "POST",
            data: $(`#addToCart_${index}`).serialize(),
            success: function(data) {
                $(".cartBadge").html(data)
            },
            error: function(err) {
                if(err.status === 401){
                    window.location.href = "/login";
                 }
            }
        });
    });

    $(`#addToList_${index}`).submit(function(e){
        e.preventDefault();
        $.ajax({
            url: $(`#addToList_${index}`).attr("action"),
            type: "POST",
            data: $(`#addToList_${index}`).serialize(),
            success: function(data) {
                $(".listBadge").html(data)
            },
            error: function (err){
                if(err.status === 401){
                    window.location.href = "/login";
                }
            }
        })
    });
};

$("#addToCartForm").submit(function(e){
    e.preventDefault();
    $.ajax({
        url: $("#addToCartForm").attr("action"),
        type: "POST",
        data: $("#addToCartForm").serialize(),
        success: function(data) {
            $(".cartBadge").html(data)
        },
        error: function (err){
            if(err.status === 401){
                window.location.href = "/login";
            }
        }
    })
});
