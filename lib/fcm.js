'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var admin = require("firebase-admin");

var serviceAccount = void 0;

var Fcm = function () {
  function Fcm(config) {
    _classCallCheck(this, Fcm);

    this.config = config;
    var rootDir = process.mainModule.paths[0].split('server')[0].slice(0, -1);
    serviceAccount = require(rootDir + '/services/' + this.config.serviceAccountJson);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: serviceAccount.databaseUrl
      });
    }
  }

  _createClass(Fcm, [{
    key: 'sendAppPushNotification',
    value: function sendAppPushNotification(notificationJson) {
      console.log(notificationJson);
      return new Promise(function (resolve, reject) {
        var successStatus = true,
            responseMsg = '';
        var payload = {
          notification: {
            title: notificationJson.notification.title,
            body: notificationJson.notification.body,
            clickAction: notificationJson.notification.clickAction,
            color: notificationJson.notification.color,
            icon: notificationJson.notification.icon,
            sound: notificationJson.notification.sound,
            show_in_foreground: notificationJson.notification.show_in_foreground,
            priority: notificationJson.notification.priority,
            content_available: notificationJson.notification.content_available,
            tag: notificationJson.notification.tag
          },
          data: notificationJson.notificationPayload
        };
        admin.messaging().sendToDevice(notificationJson.notificationTokens, payload).then(function (response) {
          var notificationResponse = response.results;
          notificationResponse.map(function (currResponse) {
            if (typeof currResponse['messageId'] === "undefined" || _typeof(currResponse['messageId']) === undefined) {
              successStatus = false;
              responseMsg = currResponse['error']['message'];
            }
          });
          if (!successStatus) {
            reject({
              "success": false,
              "message": responseMsg
            });
          } else {
            resolve({
              "success": true,
              "body": response
            });
          }
        }).catch(function (error) {
          reject({
            "success": false,
            "message": error.message
          });
        });
      });
    }
  }, {
    key: 'sendWebPushNotification',
    value: function sendWebPushNotification(notificationJson) {
      var notification = {
        title: notificationJson.notification.title,
        body: notificationJson.notification.body,
        clickAction: notificationJson.notification.clickAction,
        color: notificationJson.notification.color,
        icon: notificationJson.notification.icon,
        sound: notificationJson.notification.sound,
        show_in_foreground: notificationJson.notification.show_in_foreground,
        priority: notificationJson.notification.priority,
        content_available: notificationJson.notification.content_available,
        tag: notificationJson.notification.tag
      };
      notificationJson.data.notification = notification;
      var payload = {
        data: notificationJson.data
      };
      return new Promise(function (resolve, reject) {
        admin.messaging().sendToDevice(notificationJson.notificationTokens, payload).then(function (response) {
          resolve({
            "success": true,
            "body": response
          });
        }).catch(function (error) {
          reject({
            "success": false,
            "message": error.message
          });
        });
      });
    }
  }]);

  return Fcm;
}();

exports.default = Fcm;