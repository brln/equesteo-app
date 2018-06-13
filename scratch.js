
Skip to content

    Pull requests
    Issues
    Marketplace
    Explore

    @equesteo

3,547
65,031

    14,716

facebook/react-native
Code
Issues 637
Pull requests 220
Projects 0
Wiki
Insights
Flatlist performance slow #13649
Closed
diegorodriguesvieira opened this Issue on Apr 24, 2017 · 12 comments
Comments
Assignees
No one assigned
Labels
None yet
Projects
None yet
Milestone
No milestone
Notifications

You’re not receiving notifications from this thread.
12 participants
@diegorodriguesvieira
@navid94
@gabrielgomesferraz
@gregblass
@aminosman
@saurabhspatil
@nikolal
@kyle-ssg
@danielsukmana
@bl4ze
@NkFab
@hramos
@diegorodriguesvieira
diegorodriguesvieira commented on Apr 24, 2017
Description

I'm using FlatList to load some records. Above the FlatList I have a button and when I tap this button with 230 items loaded in the FlatList, the performance gets horrible.

I'm using a Smartphone ASUS Zenfone Go LTE ZB500KL-1A058BR with android 6.0

I've created a video to better illustrate:
http://www.youtube.com/watch?v=EIlDnoewVhc
My code:

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';

const GLOBAL_DATA = [];
const PER_PAGE = 10;

const paginateArray = (array, pageSize, pageNumber) => {
  const _pageNumber = pageNumber - 1;
  return array.slice(_pageNumber * pageSize, (_pageNumber + 1) * pageSize);
};

for (let i = 0; i <= 1000; i++) {
  GLOBAL_DATA.push({
    key: i,
    produto: {
      descricao: 'Item number ' + i,
    }
  });
}

export default class flatlistdemo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      type: 'default',
      data: [],
      page: 1,
    };
  }

  componentDidMount() {
    this.setState({
      data: paginateArray(GLOBAL_DATA, PER_PAGE, this.state.page),
    });
  }

  getPagedOffers = () => {
    this.setState((state) => ({
      data: state.data.concat( paginateArray(GLOBAL_DATA, PER_PAGE, this.state.page) ),
    }));
  }

  handleLoadMore = () => {
    this.setState(
      {
        page: this.state.page + 1,
      },
      () => {
        this.getPagedOffers();
      }
    );
  }

  renderType = () => {
    if (this.state.type === 'default') {
      return (
        <View>
          <TouchableOpacity
            onPress={() => {
              this.setState({
                type: 'other'
              });
            }}
            style={{backgroundColor: 'black', padding: 10}}
          >
            <Text
              style={{color: '#fff'}}
            >
              touch here to change the type 01
            </Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View>
          <TouchableOpacity
            onPress={() => {
              this.setState({
                type: 'default'
              });
            }}
            style={{backgroundColor: 'blue', padding: 10}}
          >
            <Text
              style={{color: '#fff'}}
            >
              touch here to change the type 02
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderType()}
        <FlatList
          data={this.state.data}
          onEndReached={this.handleLoadMore}
          onEndReachedThreshold={50}
          getItemLayout={(data, index) => (
            {length: 40, offset: 40 * index, index}
          )}
          renderItem={
            ({item}) => {
              return (
                <View
                style={{
                  paddingVertical: 10,
                }}>
                  <TouchableOpacity onPress={() => null}>
                    <Text
                      style={{
                        color: '#000',
                        height: 40,
                        justifyContent: 'center'
                      }}>
                      {item.produto.descricao}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    alignItems: 'center',
  },
});

AppRegistry.registerComponent('flatlistdemo', () => flatlistdemo);

Solution

Maybe something is wrong with my display: none / block?
Additional Information

    React Native version: 0.43.4
    Platform: Android 6.0
    Development Operating System: MacOS Sierra
    Dev tools: Xcode

@navid94
navid94 commented on Apr 25, 2017

I think that you have to create a React.PureComponent for each item that you render in renderItem:

class MyListItem extends React.PureComponent {
  render() {
    return (
        <View
                style={{
                  paddingVertical: 10,
                }}>
                  <TouchableOpacity onPress={() => null}>
                    <Text
                      style={{
                        color: '#000',
                        height: 40,
                        justifyContent: 'center'
                      }}>
                      {this.props.produto.descricao}
                    </Text>
                  </TouchableOpacity>
                </View>
    )
  }
}

_renderItem = ({item}) => (
    <MyListItem
         produto={item.produto}
    />
  );

<FlatList
          data={this.state.data}
          onEndReached={this.handleLoadMore}
          onEndReachedThreshold={50}
          getItemLayout={(data, index) => (
            {length: 40, offset: 40 * index, index}
          )}
          renderItem={this._renderItem}
        />

This should make performance much better since items will not update everytime, as suggested here http://facebook.github.io/react-native/releases/0.44/docs/flatlist.html (doc version 0.44). Otherwise you can use http://facebook.github.io/react-native/docs/virtualizedlist.html#shoulditemupdate , but it will be deprecated in 0.44 in favor of React.PureComponent. Before using PureComponent read the following:

This is a PureComponent which means that it will not re-render if props remain shallow- equal. Make sure that everything your renderItem function depends on is passed as a prop that is not === after updates, otherwise your UI may not update on changes. This includes the data prop and parent component state.
@diegorodriguesvieira
diegorodriguesvieira commented on Apr 25, 2017 •

@navid94 Thank you so much man, you saved my life!
@gabrielgomesferraz
gabrielgomesferraz commented on Apr 25, 2017

@navid94 Thank you so much man!
@hramos hramos closed this on Apr 25, 2017
@gregblass
gregblass commented on May 15, 2017

Thank you for this! I should read the docs more clearly.
@gregblass gregblass referenced this issue in react-navigation/react-navigation on May 15, 2017
Closed
Is StackNavigator broken on iOS? #836
@kanzitelli kanzitelli referenced this issue in react-navigation/react-navigation on Jun 28, 2017
Closed
When using TabNavigation in combination with StackNavigation the FlatList loads slower on navigation between screens #1898
@hailie-rei hailie-rei referenced this issue on Jul 29, 2017
Closed
Touchable elements within FlatList / SectionList not registering #14155
@aminosman
aminosman commented on Sep 7, 2017

Implement shouldComponentUpdate for even more performance boosting.
@arussellk arussellk referenced this issue on Oct 3, 2017
Closed
FlatList performance slow for large changes to list #16186
@saurabhspatil
saurabhspatil commented on Oct 9, 2017

How can i update particular row in flatlist by onPress for above code
@nikolal
nikolal commented on Oct 12, 2017

@navid94

Great stuff.

This was huge performance boost for my several large lists connected to a socket.

You just saved me from a lot of refactoring. +1
@gregblass
gregblass commented on Oct 21, 2017 •

Are functional components even better in this case than pure components? My list items don't need state at all, so I figured that would be the most performant solution? Or are they going to be not as efficient as a pure component for some reason?

EDIT: Functional components are not better in cases like this. You want to use pure components or shouldComponentUpdate.
@kyle-ssg
kyle-ssg commented on Nov 20, 2017 •

I wrote a simple app here that shows a few different options for rendering with flat lists and a simple render time log by comparing the componentWillUpdate and componentDidUpdate calls, the main thing to keep in mind is whenever you render a collection of components and use shouldComponentUpdate you should either pull children out into components or just surround your nested views in {()=>(...)}.

From my understanding the main cause of the performance difference is mainly due to unnecessary function allocation per render cycle - you'll definitely see this if your child components have something like onPress={()=>{}}. In my example I render a list of very simple components in a few different ways, even in this simple example there is a vast difference in render time between the first approach and the others:

import React, {Component} from 'react';
import {FlatList, TouchableOpacity, Platform, ScrollView, StyleSheet, Text, View} from 'react-native';
import _ from 'lodash';


const GUID = function (append) {
    var d = new Date().getTime();
    var uuid = 'xxxx-xxxx-xxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    return append ? uuid + '-' + append : uuid;
};

const Message = class extends Component {

    shouldComponentUpdate = ()=> {
        return false;
    }

    constructor(props, context) {
        super(props, context);
        this.state = {};
    }

    render() {
        console.log("Rendering")

        return (
            <View>
                {typeof this.props.children == "function" ? this.props.children() : this.props.children}
            </View>
        );
    }
};


const MessageInner = class extends Component {
    displayName: 'TheComponent'


    render() {
        return (
            <View style={styles.messageContainer}>
                <TouchableOpacity onPress={this.props.onPress}>
                    <Text style={styles.messageText}>{this.props.id}</Text>
                </TouchableOpacity>
            </View>
        );
    }
};


MessageInnerPure = (props)=>(
    <View style={styles.messageContainer}>
        <TouchableOpacity onPress={props.onPress}>
            <Text style={styles.messageText}>{props.id}</Text>
        </TouchableOpacity>
    </View>
)

let date = new Date();

export default class App extends Component<{}> {
    constructor(props, context) {
        super(props, context);
        this.state = {
            messages: _.times(100).map(()=> {
                return {id: GUID()}
            })
        };
    }

    componentWillUpdate() { date = new Date();}

    componentDidUpdate() {console.log(new Date().valueOf() - date.valueOf())}

    addMessage = ()=> {
        this.setState({
            messages: [{id: GUID()}].concat(this.state.messages)
        })
    }

    render() {
        return (
            <View style={{flex: 1, padding: 50}}>
                <TouchableOpacity
                    style={{padding: 50}}
                    onPress={this.addMessage}>
                    <Text>Add</Text>
                </TouchableOpacity>
                <FlatList
                    data={this.state.messages}
                    keyExtractor={(l) => l.id}
                    renderItem={({item}) => {
                        return (
                            <View key={item.id}>
                                <Message
                                    key={item.id}
                                    onSelect={() => this.expand(item.id)}
                                    data={item}>

                                    {
                                        /*Option 1 (Slowest)
                                         render components inline, this is really bad as child components still get evaluated */
                                    }

                                    <View style={styles.messageContainer}>
                                    <TouchableOpacity onPress={this.addMessage}>
                                    <Text style={styles.messageText}>{item.id}</Text>
                                    </TouchableOpacity>
                                    </View>

                                    {
                                        /*Option 2 Wrap component within a function,
                                         this only gets called if parent shouldComponentUpdate returns true (pretty much the same as splitting it into a pure component */
                                    }
                                    {()=>(
                                        <View style={styles.messageContainer}>
                                            <TouchableOpacity onPress={this.addMessage}>
                                                <Text style={styles.messageText}>{item.id}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {/*Option 3 render as component*/}
                                    {/*<MessageInner onPress={this.addMessage} id={item.id}/>*/}

                                    {/*Option 4 render as pure component*/}
                                    {/*<MessageInnerPure onPress={this.addMessage} id={item.id}/>*/}

                                </Message>
                            </View>
                        )
                    }}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    messageContainer: {
        alignSelf: "flex-start",
        backgroundColor: "#f1f1f1",
        marginBottom: 10,
        padding: 10,
        borderRadius: 4
    },
    messageText: {
        fontWeight: "bold"
    }
});
