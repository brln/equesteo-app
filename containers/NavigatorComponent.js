import { PureComponent } from 'react'

import { brand, white } from '../colors'


export default class NavigatorComponent extends PureComponent {
  static navigatorStyle = {
    navBarBackgroundColor: brand,
    topBarElevationShadowEnabled: false,
    navBarTextColor: white,
    navBarButtonColor: white,
  }
}
