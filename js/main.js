document.addEventListener("DOMContentLoaded", init);

function init(){
    console.debug("page is loaded successfully");

    loadJsonData("data/cheese.json");
}

function loadJsonData (path){
    var jsonScriptTag = document.createElement("script");
    jsonScriptTag.addEventListener("load", onLoadJson );
    document.querySelector("body").appendChild(jsonScriptTag);
    jsonScriptTag.setAttribute("src",path);
}

function onLoadJson(){
    console.log(myData);
}
