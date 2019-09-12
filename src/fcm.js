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
      tag: notificationJson.notification.tag,
      data: JSON.stringify(notificationJson.notificationPayload)
    };
    notificationJson.notificationPayload.notification = JSON.stringify(notification);
    const payload = {
      data: notificationJson.notificationPayload
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

  subscribeToTopic(notificationJson){
    return new Promise((resolve, reject) => {
      try{
        const {
          registrationTokens = [],
          topic
        } = notificationJson;

        admin.messaging().subscribeToTopic(registrationTokens, topic).then(
          response => resolve({
              "success": true,
              "message": response
          })
        ).catch(
          error => reject({
            "success": false,
            "message": error.message,
          })
        );
      }catch(error){
        return reject({
          "success": false,
          "message": error.message,
        }); 
      }
    });
  }

  unsubscribeFromTopic(notificationJson){
    return new Promise((resolve, reject) => {
      try{
        const {
          registrationTokens = [],
          topic
        } = notificationJson;

        admin.messaging().unsubscribeFromTopic(registrationTokens, topic).then(
          response => resolve({
              "success": true,
              "message": response
          })
        ).catch(
          error => reject({
            "success": false,
            "message": error.message,
          })
        );
      }catch(error){
        return reject({
          "success": false,
          "message": error.message,
        });
      }
    });
  }

  sendNotificationToTopic(notificationJson, topic){
    return new Promise((resolve, reject) => {
      try{
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
          tag: notificationJson.notification.tag,
          data: JSON.stringify(notificationJson.notificationPayload)
        };
        notificationJson.notification = JSON.stringify(notification);
        notificationJson.notificationPayload = JSON.stringify(notificationJson.notificationPayload);
        const payload = {
          data: notificationJson,
          topic
        };

        admin.messaging().send(payload).then(
          response => resolve({
              "success": true,
              "message": response
          })
        ).catch(
          error => reject({
            "success": false,
            "message": error.message,
          })
        );
      }catch(error){
        return reject({
            "success": false,
            "message": error.message,
          });
      }
    });
  }
}