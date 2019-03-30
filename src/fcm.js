const admin = require("firebase-admin");

let serviceAccount;
export default class Fcm {
  constructor(config) {
    this.config = config;
    let rootDir = process.mainModule.paths[0].split('server')[0].slice(0, -1);
    serviceAccount = require(rootDir + '/services/' + this.config.serviceAccountJson);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: serviceAccount.databaseUrl
      });
    }
  }

  sendAppPushNotification(notificationJson) {
    console.log(notificationJson);
    return new Promise((resolve, reject) => {
      var successStatus = true, responseMsg = '';
      const payload = {
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
      admin.messaging().sendToDevice(notificationJson.notificationTokens, payload)
        .then(response => {
          const notificationResponse = response.results;
          notificationResponse.map((currResponse) => {
            if (typeof (currResponse['messageId']) === "undefined" || typeof (currResponse['messageId']) === undefined) {
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
        })
        .catch(error => {
          reject({
            "success": false,
            "message": error.message
          })
        });
    });
  }

  sendWebPushNotification(notificationJson) {
    const notification = {
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
    const payload = {
      data: notificationJson.data
    }
    return new Promise((resolve, reject) => {
      admin.messaging().sendToDevice(notificationJson.notificationTokens, payload)
        .then(response => {
          resolve({
            "success": true,
            "body": response
          });
        })
        .catch(error => {
          reject({
            "success": false,
            "message": error.message
          })
        });
    });
  }

}