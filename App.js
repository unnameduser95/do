import 'react-native-gesture-handler';  // react navigation stupidity

import React, { useState, useEffect } from 'react';
import { 
  Platform,
  ActivityIndicator,
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions,
  TextInput,
  StatusBar,
  FlatList
} from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import AsyncStorage from '@react-native-community/async-storage';
import Modal from 'react-native-modal';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import List from './src/screens/List';
import Lists from './src/screens/Lists';

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode={"none"}>
        <Stack.Screen name="Lists" component={Lists} />
        <Stack.Screen name="List" component={List} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const creationStyles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    height: 200,
    width: 300,
    borderRadius: 5,
  },
  nameContainer: {
    width: 300,
    flex: 1,
    justifyContent: "center",
  },
  // nameText: {
  //   color: "#b0b0b0",
  //   marginLeft: 2,
  //   marginBottom: 2,
  // },
  input: {
    color: "#000000",
    fontSize: 16,
    borderTopWidth: 1,
    borderColor: "#f2f2f2",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    paddingLeft: 5,
    height: 55,
  },
  bottom: {
    width: 300,
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    height: 40,
    width: 75,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  cancelButtonText: {
    color: "rgba(0, 122, 255, 1)",
  },
  createButton: {
    backgroundColor: "rgba(0, 122, 255, 1)",
    borderRadius: 5,
  },
  createButtonText: {
    color: "white",
  }
})

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 90,
    marginHorizontal: 10,
  },
  placeholderText: {
    alignSelf: "center",
    marginTop: 20,
    fontSize: 17,
    fontStyle: "italic",
    color: "#b0b0b0"
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
  },
  listContainer: {
    width: screenWidth,
    alignSelf: "center",
  },
  listItem: {
    flex: 1,
    flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "center",
    height: 55,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2"
    // borderWidth: 1,
    // borderColor: "#f2f2f2",
  },
  listContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
  },
  listEnd: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  listText: {
    fontSize: 17,
  },
  listNum: {
    marginRight: 5,
    fontSize: 17,
    color: "#b0b0b0"
  },
  modal: {  // make sure damn thing is centered
    justifyContent: "center",
    alignItems: "center",
  }
});
