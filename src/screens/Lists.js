import React, { useState, useEffect } from 'react';
import { 
  ActivityIndicator,
  StyleSheet,
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions,
  TextInput,
  StatusBar,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import AsyncStorage from '@react-native-community/async-storage';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { getData, setData } from '../components/Sync';

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

const ListItem = ({ title, num, onPress, isDisabled }) => {  // num: number of tasks in list
  return (
    <TouchableOpacity 
      style={styles.listItem}  
      onPress={onPress}
      disabled={isDisabled ? isDisabled : false}
    >
      <View style={styles.listContent}>
        <Text style={[styles.listText, { color: isDisabled ? "#b0b0b0" : "#000000" }]}>{title}</Text>
        <View style={styles.listEnd}>
          <Text style={styles.listNum}>{num}</Text>
          <Ionicons name={"ios-arrow-forward"} size={16} color="#b0b0b0" />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const NewListCreation = ({ onComplete, onCreate }) => {  // what appears inside modal
  const [name, setName] = useState("");

  return (
    <View style={creationStyles.container}>
      <View style={creationStyles.nameContainer}>
        <TextInput 
          style={creationStyles.input} 
          placeholder="Name of list"
          placeholderTextColor="#b0b0b0"
          autoFocus={true}
          onChangeText={(text) => setName(text)}
        />
      </View>
      <View style={creationStyles.bottom}>
        <TouchableOpacity 
          style={creationStyles.actionButton}
          onPress={onComplete}  
        >
          <Text style={creationStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[creationStyles.actionButton, creationStyles.createButton]}
          onPress={() => {  // list object as it appears in lists screen
            onCreate({  // run callback passed through prop
              "title": name,
              "description": "",
              "todos": [],
            });
            onComplete();
          }}
        >
          <Text style={creationStyles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Lists = () => {
  const navigation = useNavigation();

  const [lists, setLists] = useState(null);
  const [loading, setLoading] = useState(true);  // this will be more important for cloud storage stuff
  const [listCreation, setListCreation] = useState(false);  // display creation "modal"

  const _refresh = async () => {  // performs series of actions
    const listIds = await _getLists();
    const data = listIds ? await _getListsData(listIds) : null;

    setLists(data);
    setLoading(false);
  }
  
  const _getLists = async () => {  // will only get ids
    try {
      const value = await getData("lists");  // gets array of list ids

      // setLists(value ? JSON.parse(value) : value);
      // setLoading(false);

      const parsedValue = JSON.parse(value);
      // console.log(parsedValue);

      return parsedValue;
    } catch (e) {
      console.error(e);
    }
  }

  const _getListsData = async (listIds) => {  // use array of list IDs to get updated list data
    const _loadFromStorage = async (id) => {
      const response = await getData("list-".concat(id));

      return JSON.parse(response);
    }

    const listData = await Promise.all(listIds.map(async (element) => {
      return await _loadFromStorage(typeof element === "object" ? element.id : element);
    }));  // typeof element may change in future

    return listData;
  }

  const _onCreate = async (newList) => {   // id is generated here

    // id generation
    // currently doesn't check for duplicate ids, will implement later
    const id = Math.round(Math.random() * 100000000);
    let list = newList;
    list.id = id.toString();  // FlatList component only takes string IDs

    setData("list-".concat(list.id), list);  // create separate list item

    const listOfLists = await _getLists();

    if (listOfLists) {
      let newListOfLists = listOfLists;
      newListOfLists.push(list.id);

      await setData("lists", newListOfLists);
      _refresh();
    } else {
      await setData("lists", [list.id]);
      _refresh();
    }
  }

  const _onReset = () => {  // oh no
    Alert.alert(
      "Are you sure about this?", 
      'Pressing "Reset" will permanently delete all stored lists and to-dos.', 
      [
        {
          text: "Cancel",
        },
        {
          text: "Reset",
          onPress: () => {
            AsyncStorage.clear();
            setLists(null);
          },
          style: "destructive",
        }
      ]
    );
  }

  useEffect(() => {
    // AsyncStorage.clear()
    _refresh();
  }, [])

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.heading} allowFontScaling={false}>Lists</Text>
          <TouchableOpacity onPress={
            () => _onReset()
          } style={{marginRight: 10}}>
            <Ionicons name="ios-trash" size={35} color={"red"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={
            () => setListCreation(true)
          }>
            <Ionicons name="ios-add-circle" size={35} color={"rgba(0, 122, 255, 1)"} />
          </TouchableOpacity>
        </View>
        {lists ? 
          <FlatList 
            data={lists}
            renderItem={({ item }) => <ListItem title={item.title} num={item.todos.length} onPress={() => navigation.navigate("List", {
              list: item
            })} />}
            keyExtractor={item => item.id}
            style={styles.listContainer}
            refreshControl={
              <RefreshControl 
                refreshing={loading} 
                onRefresh={() => {
                  setLoading(true);
                  _refresh();
                }} 
                tintColor={"#b0b0b0"}
              />
            }
          />
        :
          loading ?
            <Text style={styles.placeholderText} allowFontScaling={false}>Loading...</Text>  // user should rarely see this (except on first load)
          :
            <Text style={styles.placeholderText} allowFontScaling={false}>Tap the button above to create your first list!</Text>
        }

        <Modal 
          style={styles.modal} 
          isVisible={listCreation}
          animationIn="fadeIn"
          animationOut="fadeOut"
          avoidKeyboard
          hideModalContentWhileAnimating
          backdropTransitionOutTiming={0}
        >
          <NewListCreation onComplete={() => setListCreation(false)} onCreate={(newList) => _onCreate(newList)}/>
        </Modal>
      </View>
    </SafeAreaView>
  );
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
    flex: 1,
  },
  listContainer: {
    width: screenWidth,
    alignSelf: "center",
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2",
  },
  listItem: {
    flex: 1,
    flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "center",
    height: 55,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2"
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
  },
});

export { ListItem };