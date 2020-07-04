import React, { Component } from 'react';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from 'react-native-push-notification';

import { setData, getData } from './Sync';

const NotifService = {
  configure: () => {
    PushNotification.configure({
      onRegister: function (tokenData) {
        console.log(tokenData);
        setData("token", tokenData);  // store notification token in local storage
      },
      onNotification: function (notification) {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      }
    });
  }
};

export default NotifService;

