import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList, TextInput } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';

const DATA = {  // fake data
  title: "fuck frame drops",
  todos: [
    {
      title: "Task 1",
      description: "This is a description",
      id: "1",
      complete: true
    },
    {
      title: "Task 2",
      description: "This is another description",
      id: "2",
      complete: false
    },
  ] 
}

const Todo = ({ title, description, complete, onChangeText, id }) => {

  return (
    <View style={styles.todo}>
      <TouchableOpacity style={styles.checkbox}>
        <Ionicons name={complete ? "ios-checkmark-circle" : "ios-radio-button-off"} size={30} color="#b0b0b0"/>
      </TouchableOpacity>
      <TextInput style={styles.todoInput} value={title} onChangeText={(text) => onChangeText(id, text)} />
    </View>
  )
}

export default function List({ route }) {
  const [list, setList] = useState(route.params.list);
  // const [list, setList] = useState(DATA);
  const [loading, setLoading] = useState(false);

  const onChangeText = (id, text) => {
    // console.log("list", list);
    const newListTodos = list.todos.map((item) => {
      if (item.id === id) {
        // console.log("item", item);
        let updatedItem = item;
        updatedItem.title = text;
      }

      return item;
    });

    // console.log("newListTodos", newListTodos);

    setList({ ...list, todos: newListTodos });  // WHY IS THE ... ACTUALLY PART OF THE SYNTAX WTF
  
  }

  const onCreateTodo = () => {
    let newListTodos = list.todos;
    
    // id generation
    // currently doesn't check for duplicate ids, will implement later
    const id = Math.round(Math.random() * 1000000);

    newListTodos.push({
      title: "",
      description: "",
      complete: false,
      id: id.toString(),
    });

    setList({ ...list, todos: newListTodos });  // WHY IS THE ... ACTUALLY PART OF THE SYNTAX WTF
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.headerContainer}>
        <Text style={styles.heading} allowFontScaling={false}>{list.title}</Text>
        <TouchableOpacity onPress={onCreateTodo}>
          <Ionicons name="ios-add-circle" size={35} color="rgba(0, 122, 255, 1)" />
        </TouchableOpacity>
      </View>
      {list.todos.length !== 0 ? 
        <FlatList 
          data={list.todos}
          renderItem={({ item }) => <Todo title={item.title} id={item.id} description={item.description} complete={item.complete} onChangeText={(id, text) => onChangeText(id, text)} />}
          keyExtractor={item => item.id}
          style={styles.listContainer}
        />
      :
        loading ?
          <Text style={styles.placeholderText} allowFontScaling={false}>Loading...</Text>  // user should rarely see this (except on first load)
        :
          <Text style={styles.placeholderText} allowFontScaling={false}>Tap the button above to create your first to-do!</Text>
      }
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
  placeholderText: {
    alignSelf: "center",
    marginTop: 20,
    fontSize: 17,
    fontStyle: "italic",
    color: "#b0b0b0"
  },
  todo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 55,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2"
  },
  checkbox: {
    margin: 10,
  },
  todoInput: {
    color: "#000000",
    flex: 1,
    height: 55,
    fontSize: 17,
  }
})