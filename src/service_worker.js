
chrome.identity.getProfileUserInfo(function(userInfo) { email = userInfo.email; });

useCurrentAccount = true;

getState(function(state) {
   updateIcon(state);
});

function generateLoginHintRule(email) {
   const domain = email.split('@').pop()
   return {
      "id": 1,
      "priority": 1,
      "action": {
        "type": "redirect",
        "redirect": {
          "transform": {
            "queryTransform": {
               "removeParams": ["sid"],
              "addOrReplaceParams": [
               {
                  "key": "login_hint",
                  "value": email
                }, 
                {
                  "key": "whr",
                  "value": domain
                }
               ]
            }
          }
        }
      },
      "condition": {
         "requestDomains": ["login.microsoftonline.com"],
         "regexFilter": "/authorize.*|/saml2.*|/wsfed.*",
         "resourceTypes": ["main_frame"]
      }
   }
}

function addLoginHintRule(email) {
   chrome.declarativeNetRequest.updateSessionRules(
     {removeRuleIds: [1],
      addRules: [generateLoginHintRule(email)]},() => {
       if (chrome.runtime.lastError) {
         console.log(chrome.runtime.lastError.message);
       }
     }
   )
 }

 async function updateLoginHintRuleAdd(email) {
   addLoginHintRule(email);
 }

 chrome.runtime.onStartup.addListener(
   getState(state => {
      if (state === true) {
         updateLoginHintRuleAdd(email);
      }
   })
 );

 chrome.tabs.onCreated.addListener((tab) => {
   getState(state => {
      if (state === true) {
         updateLoginHintRuleAdd(email);
      }
   });
 });

function setState(state){
   useCurrentAccount = state;
   chrome.storage.local.set({
      state: state
  });
}

function getState(callback) {
   chrome.storage.local.get('state', function(data) {
      if(data.state === undefined) {
         useCurrentAccount = true;
      }
      else{
         useCurrentAccount = data.state;
      }

      callback(useCurrentAccount);
   });
}

getState(function(state) {
   updateIcon(state);
});

chrome.action.onClicked.addListener(function() {
   getState(function(state) {
       var newState = !state;
       updateIcon(newState);
       setState(newState);
   });
});

function updateIcon(state) {
   var color = [255, 0, 0, 255];
   var text = state ? '' : 'Off';
   chrome.action.setBadgeBackgroundColor({
       color: color
   });

   chrome.action.setBadgeText({
       text: text
   });
}
