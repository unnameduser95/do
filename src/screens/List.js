import React from 'react';
import { View, Text } from 'react-native';

export default function List({ route }) {
  console.log(route.params.list);

  return (
    <View>
      <Text>Hello World</Text>
    </View>
  )
}