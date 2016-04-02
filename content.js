// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'report_back') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        var textLength = document.body.innerText.split(' ').length;
        //console.log(StateEnum.DISPLAY);
        /*
        if (textLength > 10) {
            setState(StateEnum.DISPLAY);
            console.log("update called display");
        }*/
        sendResponse(textLength);
        
        
    }
});