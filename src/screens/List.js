import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';

export default function List({ route }) {
  console.log(route.params.list);

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.headerContainer}>
        <Text style={styles.heading} allowFontScaling={false}>{route.params.list.title}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 90,
    marginHorizontal: 10,
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
  },
})