import React from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';

const screenWidth = Dimensions.get("screen").width;

const SwipeableDelete = () => {
  return (
    <View style={[styles.swipeable, {backgroundColor: "red"}]}>
      <Ionicons name="ios-trash" size={35} color={"white"} style={styles.swipeableIcon} />
    </View>
  )
}

const styles = StyleSheet.create({
  swipeable: {
    backgroundColor: "rgba(0, 122, 255, 1)",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: screenWidth,
    height: 55,
  },
  swipeableIcon: {
    margin: 10,
  }
})

export { SwipeableDelete };