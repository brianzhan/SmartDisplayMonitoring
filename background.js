// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * States that the extension can be in.
 */

var saveResponse;

var StateEnum = {
  DISABLED: 'disabled',
  DISPLAY: 'display',
};

/**
 * Key used for storing the current state in {localStorage}.
 */
var STATE_KEY = 'state';

/**
 * Should the old {chrome.experimental.power} API be used rather than
 * {chrome.power}?
 */
var useOldApi = !chrome.power;

/**
 * Loads the locally-saved state asynchronously.
 * @param {function} callback Callback invoked with the loaded {StateEnum}.
 */
function loadSavedState(callback) {
  chrome.storage.local.get(STATE_KEY, function(items) {
    var savedState = items[STATE_KEY];
    for (var key in StateEnum) {
      if (savedState == StateEnum[key]) {
        callback(savedState);
        return;
      }
    }
    callback(StateEnum.DISABLED);
  });
}

/**
 * Switches to a new state.
 * @param {string} newState New {StateEnum} to use.
 */
function setState(newState) {
  var imagePrefix = 'night';
  var title = '';


  switch (newState) {
    case StateEnum.DISABLED:
      (useOldApi ? chrome.experimental.power : chrome.power).releaseKeepAwake();
      imagePrefix = 'night';
      title = chrome.i18n.getMessage('disabledTitle');
      break;
    case StateEnum.DISPLAY:
      if (useOldApi)
        chrome.experimental.power.requestKeepAwake(function() {});
      else
        chrome.power.requestKeepAwake('display');
      imagePrefix = 'day';
      title = chrome.i18n.getMessage('displayTitle');
      break;
    default:
      throw 'Invalid state "' + newState + '"';
  }

  var items = {};
  items[STATE_KEY] = newState;
  chrome.storage.local.set(items);

  chrome.browserAction.setIcon({
    path: {
      '19': 'images/' + imagePrefix + '-19.png',
      '38': 'images/' + imagePrefix + '-38.png'
    }
  });
  chrome.browserAction.setTitle({title: title});
}

chrome.browserAction.onClicked.addListener(function() {
    console.log("hello world");
    loadSavedState(function(state) {
    switch (state) {
      case StateEnum.DISABLED:
        setState(StateEnum.DISPLAY);
        break;
      case StateEnum.DISPLAY:
        setState(StateEnum.DISABLED);
        break;   
      default:
        throw 'Invalid state "' + state + '"';
    }
  });
});


chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    var saveIt;
    chrome.tabs.sendMessage(tab.id, {text: 'report_back'}, doStuffWithDom);
    
});

function doStuffWithDom(domContent) {
    console.log(domContent);
    if (domContent > 10) {
        console.log("modifying display");
        setState(StateEnum.DISPLAY);
    } else if (domContent < 10) {
        setState(StateEnum.DISABLED);
    }
}


/*
      f
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  console.log("update called");
  chrome.tabs.getSelected(null, function(tab) {
    if (changeInfo.status == 'complete' && tab.active) {
        console.log("update listener called");
        var wordCount = document.body.innerText.split(' ').length
        if (wordCount > 10) {
            setState(StateEnum.DISPLAY);
            console.log("update called display");
        }
        else {
            setState(StateEnum.DISABLED);
            console.log("update called disable with ", wordCount, " which is ", document.body.innerText.split(' ').length >10 );
            console.log ("body is :", document.body.innerText);
        }
    }
  });
});*/

/*
chrome.tabs.onActivated.addListener(function(activeInfo) {
  console.log("activation called");
  if (tab.active) {
      if (document.body.innerText.split(' ').length > 10) {
            setState(StateEnum.DISPLAY);
            console.log("activation called display");
        }
        else {
            setState(StateEnum.DISABLED);
            console.log("activation called disable");
        }      
  }

}); */


function getText(){
    document.body.innerText.split(' ').length;
}



chrome.runtime.onStartup.addListener(function() {
  loadSavedState(function(state) { setState(state); });
});

// TODO(derat): Remove this once http://crbug.com/222473 is fixed.
chrome.windows.onCreated.addListener(function() {
  loadSavedState(function(state) { setState(state); });
});
