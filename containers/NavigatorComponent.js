import { Component } from 'react'

import { brand, white } from '../colors'


export default class NavigatorComponent extends Component {
  static navigatorStyle = {
    navBarBackgroundColor: brand,
    topBarElevationShadowEnabled: false,
    navBarTextColor: white,
    navBarButtonColor: white,
  }
}
